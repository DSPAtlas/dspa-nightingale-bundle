import type { Model } from "molstar/lib/mol-model/structure";
import type { Mapping } from "./position-mapping";
/** Matches the active-site annotation track. */
export declare const ACTIVE_SITE_COLOR = 11901696;
export type ActiveSiteMapping = {
    proteinAccession: string;
    kind: "alphafold";
    uniprotStart?: number;
    uniprotEnd?: number;
} | {
    proteinAccession: string;
    kind: "pdb";
    mappings: readonly Mapping[];
};
export declare function setActiveSiteMapping(model: Model, mapping: ActiveSiteMapping | undefined): void;
/** Changing annotations or mapping invalidates Mol*'s theme equality cache. */
export declare function getActiveSiteColorVersion(model: Model): number;
/** Cached residue membership avoids scanning the annotation ranges for every atom. */
export declare function isActiveSiteAtom(model: Model, atomIndex: number): boolean;
//# sourceMappingURL=active-site-color.d.ts.map