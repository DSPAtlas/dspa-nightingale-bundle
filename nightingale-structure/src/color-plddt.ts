import { Bond, Model, StructureElement, Unit } from "molstar/lib/mol-model/structure";
import { ColorTheme } from "molstar/lib/mol-theme/color";
import { ThemeDataContext } from "molstar/lib/mol-theme/theme";
import { Color } from "molstar/lib/mol-util/color";
import { getPlddtColor } from "./plddt";

const alphaFoldModels = new WeakSet<Model>();

export const markAlphaFoldModels = (models: readonly Model[], isAlphaFold: boolean) => {
  for (const model of models) {
    if (isAlphaFold) alphaFoldModels.add(model);
    else alphaFoldModels.delete(model);
  }
};

export function PlddtColorTheme(_ctx: ThemeDataContext, props: {}): ColorTheme<{}> {
  const colorAtom = (unit: Unit, element: number) => {
    if (!Unit.isAtomic(unit)) return Color(0xaaaaaa);
    const confidence = unit.model.atomicConformation.B_iso_or_equiv;
    const score = confidence.isDefined && confidence.valueKind(element) === 0
      ? confidence.value(element) : undefined;
    return Color(getPlddtColor(score, alphaFoldModels.has(unit.model)));
  };
  return {
    factory: PlddtColorTheme,
    granularity: "group",
    preferSmoothing: false,
    props,
    color: (location) => {
      if (StructureElement.Location.is(location)) return colorAtom(location.unit, location.element);
      if (Bond.isLocation(location)) return colorAtom(location.aUnit, location.aUnit.elements[location.aIndex]);
      return Color(0xaaaaaa);
    },
    description: "AlphaFold per-residue pLDDT confidence",
  };
}

export const PlddtColorThemeProvider: ColorTheme.Provider<{}, "dspa-plddt-confidence"> = {
  name: "dspa-plddt-confidence",
  label: "pLDDT confidence",
  category: ColorTheme.Category.Validation,
  factory: PlddtColorTheme,
  getParams: () => ({}),
  defaultValues: {},
  isApplicable: (ctx) => !!ctx.structure,
};
