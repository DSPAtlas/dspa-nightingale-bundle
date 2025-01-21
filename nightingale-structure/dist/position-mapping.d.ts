export type Direction = "UP_PDB" | "PDB_UP";
export type Mapping = {
    entity_id: number;
    chain_id: string;
    unp_end: number;
    unp_start: number;
    struct_asym_id: string;
    start: {
        residue_number: number;
        author_insertion_code: string;
        author_residue_number: number;
    };
    end: {
        residue_number: number;
        author_insertion_code: string;
        author_residue_number: number;
    };
};
export declare class PositionMappingError extends Error {
}
export type TranslatedPosition = {
    start: number;
    end: number;
    entity: number;
    chain: string;
};
/**
 * Translate between UniProt and PDBe positions using SIFTs mappings
 * @function translatePositions
 * @param  {number}     start            The start index for the sequence (1-based)
 * @param  {number}     end              The end index for the sequence (1-based)
 * @param  {Direction}  mappingDirection Indicates direction of mapping: UniProt to PDB or PDB to UniProt
 * @param  {Mapping[]}  mappings         The array of mapping objects
 * @return {TranslatedPosition[]}        Array of translated positions
 */
declare const translatePositions: (start: number, end: number, mappingDirection: Direction, mappings?: Mapping[]) => TranslatedPosition[];
export default translatePositions;
//# sourceMappingURL=position-mapping.d.ts.map