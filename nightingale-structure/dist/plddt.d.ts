import type { Model } from "molstar/lib/mol-model/structure";
export type PlddtScore = {
    position: number;
    score: number;
};
export type PlddtData = {
    proteinAccession: string;
    structureId: string;
    scores: PlddtScore[];
};
/** Read AlphaFold confidence from the original atomic column, not LiP properties. */
export declare const extractPlddtScores: (model: Model | undefined, uniprotStart?: number, uniprotEnd?: number) => PlddtScore[];
//# sourceMappingURL=plddt.d.ts.map