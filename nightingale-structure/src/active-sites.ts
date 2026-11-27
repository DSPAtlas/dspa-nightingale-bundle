/** Source annotations use 1-based, inclusive UniProt positions, not PDB residue IDs. */
export type ActiveSiteRange = Readonly<{ start: number; end: number }>;

export type ActiveSiteData = Readonly<{
  proteinAccession: string;
  coordinateSystem: "uniprot";
  ranges: readonly ActiveSiteRange[];
}>;

export function createActiveSiteData(proteinAccession: string, ranges: unknown): ActiveSiteData {
  const validRanges: ActiveSiteRange[] = [];
  for (const range of Array.isArray(ranges) ? ranges : []) {
    if (!range || typeof range !== "object") continue;
    const start = Number(range.start);
    const end = Number(range.end ?? range.start);
    if (Number.isInteger(start) && Number.isInteger(end) && start > 0 && end >= start) {
      validRanges.push(Object.freeze({ start, end }));
    }
  }
  return Object.freeze({
    proteinAccession,
    coordinateSystem: "uniprot",
    ranges: Object.freeze(validRanges),
  });
}

// Color themes read this metadata through active-site-color. Keep annotations
// separate from numeric LiP/pLDDT scores and their labels.
const modelActiveSites = new WeakMap<object, ActiveSiteData>();

export function setModelActiveSiteData(model: object, data: ActiveSiteData): void {
  modelActiveSites.set(model, data);
}

export function getActiveSiteData(model: object): ActiveSiteData | undefined {
  return modelActiveSites.get(model);
}
