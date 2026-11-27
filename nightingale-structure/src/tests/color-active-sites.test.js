jest.mock("../active-site-color", () => ({
  ACTIVE_SITE_COLOR: 0xB59B00,
  getActiveSiteColorVersion: jest.fn(),
  isActiveSiteAtom: jest.fn(),
}));

import { ColorTheme } from "molstar/lib/mol-theme/color";
import { getActiveSiteColorVersion, isActiveSiteAtom } from "../active-site-color";
import { withActiveSiteColor } from "../color-active-sites";

describe("active-site color overlay", () => {
  let model;
  let unit;
  let baseColor;
  let provider;
  let baseHash;

  beforeEach(() => {
    jest.clearAllMocks();
    model = { activeSiteVersion: 1 };
    unit = { kind: 0, model, elements: [11, 22, 33] };
    baseHash = 4;
    getActiveSiteColorVersion.mockImplementation(current => current.activeSiteVersion);
    isActiveSiteAtom.mockImplementation((current, element) => current === model && element === 22);
    baseColor = jest.fn((_location, isSecondary) => isSecondary ? 0x223344 : 0x112233);
    const factory = jest.fn((_ctx, props) => ({
      factory,
      color: baseColor,
      granularity: "group",
      contextHash: baseHash,
      props,
      preferSmoothing: true,
      description: "Original score coloring",
      legend: { kind: "table-legend", table: [["Score", 0x112233]] },
    }));
    provider = {
      name: "test-score-coloring",
      label: "Original score label",
      category: "Custom",
      factory,
      getParams: jest.fn(() => ({})),
      defaultValues: {},
      isApplicable: jest.fn(() => true),
      ensureCustomProperties: {
        attach: jest.fn(),
        detach: jest.fn(),
      },
    };
  });

  it("preserves the original provider hooks, parameters, legend, and description", () => {
    const wrapped = withActiveSiteColor(provider);
    const ctx = { structure: { models: [model] } };
    const props = {};
    const theme = wrapped.factory(ctx, props);
    const base = provider.factory.mock.results[0].value;

    expect(provider.factory).toHaveBeenCalledWith(ctx, props);
    for (const key of ["name", "label", "category", "getParams", "defaultValues", "isApplicable", "ensureCustomProperties"]) {
      expect(wrapped[key]).toBe(provider[key]);
    }
    expect(theme.props).toBe(props);
    expect(theme.legend).toBe(base.legend);
    expect(theme.description).toBe(base.description);
    expect(theme.granularity).toBe(base.granularity);
    expect(theme.factory).toBe(wrapped.factory);
    expect(theme.preferSmoothing).toBe(false);
  });

  it.each(["atom", "bond"])("colors an active-site %s dark yellow", kind => {
    const location = kind === "atom"
      ? { kind: "element-location", unit, element: 22 }
      : { kind: "bond-location", aUnit: unit, aIndex: 1, bUnit: unit, bIndex: 2 };
    const theme = withActiveSiteColor(provider).factory({ structure: { models: [model] } }, {});

    expect(theme.color(location, false)).toBe(0xB59B00);
    expect(isActiveSiteAtom).toHaveBeenCalledWith(model, 22);
    expect(baseColor).not.toHaveBeenCalled();
  });

  it.each([
    ["non-active atom", false, false],
    ["non-active atom", false, true],
    ["coarse atom", true, true],
    ["non-active bond", false, true],
    ["coarse bond", true, false],
    ["other location", false, true],
  ])("preserves the base color for %s (coarse=%s, secondary=%s)", (kind, coarse, isSecondary) => {
    const currentUnit = coarse ? { ...unit, kind: 1 } : unit;
    const location = kind.includes("atom")
      ? { kind: "element-location", unit: currentUnit, element: 33 }
      : kind.includes("bond")
        ? { kind: "bond-location", aUnit: currentUnit, aIndex: 2, bUnit: unit, bIndex: 1 }
        : { kind: "null-location" };
    const theme = withActiveSiteColor(provider).factory({ structure: { models: [model] } }, {});

    expect(theme.color(location, isSecondary)).toBe(isSecondary ? 0x223344 : 0x112233);
    expect(baseColor).toHaveBeenCalledWith(location, isSecondary);
    if (coarse || kind === "other location") expect(isActiveSiteAtom).not.toHaveBeenCalled();
  });

  it("keeps identical contexts equal and invalidates colors when any model's active-site version changes", () => {
    const secondModel = { activeSiteVersion: 2 };
    const ctx = { structure: { models: [model, secondModel] } };
    const wrapped = withActiveSiteColor(provider);
    const first = wrapped.factory(ctx, {});
    expect(ColorTheme.areEqual(first, wrapped.factory(ctx, {}))).toBe(true);

    secondModel.activeSiteVersion++;
    expect(ColorTheme.areEqual(first, wrapped.factory(ctx, {}))).toBe(false);
  });

  it("retains the underlying score theme's context invalidation", () => {
    const wrapped = withActiveSiteColor(provider);
    const ctx = { structure: { models: [model] } };
    const first = wrapped.factory(ctx, {});
    baseHash++;

    expect(ColorTheme.areEqual(first, wrapped.factory(ctx, {}))).toBe(false);
  });

  it("keeps the original fallback when no structure is present", () => {
    const theme = withActiveSiteColor(provider).factory({}, {});
    const location = { kind: "null-location" };

    expect(theme.color(location, false)).toBe(0x112233);
    expect(baseColor).toHaveBeenCalledWith(location, false);
    expect(getActiveSiteColorVersion).not.toHaveBeenCalled();
    expect(isActiveSiteAtom).not.toHaveBeenCalled();
  });
});
