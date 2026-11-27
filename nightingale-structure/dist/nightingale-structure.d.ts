import NightingaleElement from "@nightingale-elements/nightingale-new-core";
import type { ActiveSiteRange } from "./active-sites";
import type { PlddtData } from "./plddt";
export type { PlddtData, PlddtScore } from "./plddt";
import { Mapping } from "./position-mapping";
export type StructureData = {
    dbReferences: {
        type: "PDB" | string;
        id: string;
        properties: {
            method: string;
            chains: string;
            resolution: string;
        };
    }[];
};
export type PDBData = Record<string, {
    UniProt: Record<string, {
        identifier: string;
        name: string;
        mappings: Mapping[];
    }>;
}>;
export type PredictionData = {
    entryId: string;
    gene?: string;
    uniprotAccession?: string;
    uniprotId?: string;
    uniprotDescription?: string;
    taxId?: number;
    organismScientificName?: string;
    uniprotStart?: number;
    uniprotEnd?: number;
    uniprotSequence?: string;
    modelCreatedDate?: string;
    latestVersion?: number;
    allVersions?: number[];
    bcifUrl?: string;
    cifUrl?: string;
    pdbUrl?: string;
    distogramUrl?: string;
};
declare const NightingaleStructure_base: import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withHighlight").WithHighlightInterface> & typeof NightingaleElement;
declare class NightingaleStructure extends NightingaleStructure_base {
    #private;
    "protein-accession"?: string;
    "structure-id": string;
    "custom-download-url"?: string;
    "lipscore-array": Array<number>;
    "active-site-ranges": ActiveSiteRange[];
    "color-by": "lip" | "plddt";
    selectedMolecule?: {
        id: string;
        mappings?: Mapping[];
    };
    message?: {
        title: string;
        content: string;
    } | null;
    get plddtData(): PlddtData | null;
    private publishPlddt;
    constructor();
    private zoomIn;
    private zoomOut;
    protected render(): import("lit").TemplateResult<1>;
    protected firstUpdated(): void;
    protected updated(changedProperties: Map<PropertyKey, unknown>): void;
    disconnectedCallback(): void;
    loadPDBEntry(pdbId: string): Promise<PDBData>;
    loadAFEntry(id: string): Promise<PredictionData[]>;
    isAF(): boolean;
    selectMolecule(): Promise<void>;
    private loadSelectedMolecule;
    private showMessage;
    private clearMessage;
    updateHighlight(sequencePositions: {
        chain: string;
        position: number;
    }[]): void;
    highlightChain(): void;
}
export default NightingaleStructure;
//# sourceMappingURL=nightingale-structure.d.ts.map