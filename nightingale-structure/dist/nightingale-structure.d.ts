import NightingaleElement from "@nightingale-elements/nightingale-new-core";
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
    "lipscore-array"?: Array<number>;
    selectedMolecule?: {
        id: string;
        mappings?: Mapping[];
    };
    message?: {
        title: string;
        content: string;
    } | null;
    constructor();
    protected render(): import("lit").TemplateResult<1>;
    protected firstUpdated(): void;
    protected updated(changedProperties: Map<PropertyKey, unknown>): void;
    disconnectedCallback(): void;
    loadPDBEntry(pdbId: string): Promise<PDBData>;
    loadAFEntry(id: string): Promise<PredictionData[]>;
    isAF(): boolean;
    selectMolecule(): Promise<void>;
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