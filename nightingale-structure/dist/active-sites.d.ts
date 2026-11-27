/** Source annotations use 1-based, inclusive UniProt positions, not PDB residue IDs. */
export type ActiveSiteRange = Readonly<{
    start: number;
    end: number;
}>;
export type ActiveSiteData = Readonly<{
    proteinAccession: string;
    coordinateSystem: "uniprot";
    ranges: readonly ActiveSiteRange[];
}>;
export declare function createActiveSiteData(proteinAccession: string, ranges: unknown): ActiveSiteData;
export declare function setModelActiveSiteData(model: object, data: ActiveSiteData): void;
export declare function getActiveSiteData(model: object): ActiveSiteData | undefined;
//# sourceMappingURL=active-sites.d.ts.map