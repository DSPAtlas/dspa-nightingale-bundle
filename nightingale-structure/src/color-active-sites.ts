import { Bond, StructureElement, Unit } from "molstar/lib/mol-model/structure";
import { ColorTheme } from "molstar/lib/mol-theme/color";
import { Color } from "molstar/lib/mol-util/color";
import { hash2 } from "molstar/lib/mol-data/util";
import { ACTIVE_SITE_COLOR, getActiveSiteColorVersion, isActiveSiteAtom } from "./active-site-color";

/** Overlay active-site colors without altering the underlying score or label data. */
export function withActiveSiteColor<Id extends string>(
  provider: ColorTheme.Provider<{}, Id>,
): ColorTheme.Provider<{}, Id> {
  const factory: typeof provider.factory = (ctx, props) => {
    const base = provider.factory(ctx, props);
    if (!("color" in base)) return base;

    let contextHash = base.contextHash || 0;
    for (const model of ctx.structure?.models || []) {
      contextHash = hash2(contextHash, getActiveSiteColorVersion(model));
    }

    return {
      ...base,
      // The wrapped factory preserves this location-based theme's granularity.
      factory: factory as typeof base.factory,
      contextHash,
      preferSmoothing: false,
      color: (location, isSecondary) => {
        if (StructureElement.Location.is(location)) {
          if (Unit.isAtomic(location.unit) && isActiveSiteAtom(location.unit.model, location.element)) {
            return Color(ACTIVE_SITE_COLOR);
          }
        } else if (Bond.isLocation(location)) {
          if (Unit.isAtomic(location.aUnit)
            && isActiveSiteAtom(location.aUnit.model, location.aUnit.elements[location.aIndex])) {
            return Color(ACTIVE_SITE_COLOR);
          }
        }
        return base.color(location, isSecondary);
      },
    };
  };
  return { ...provider, factory };
}
