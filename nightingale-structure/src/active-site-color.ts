import type { Model } from "molstar/lib/mol-model/structure";
import { getActiveSiteData, ActiveSiteData, ActiveSiteRange } from "./active-sites";
import type { Mapping } from "./position-mapping";

/** Matches the active-site annotation track. */
export const ACTIVE_SITE_COLOR = 0xB59B00;

export type ActiveSiteMapping =
  | { proteinAccession: string; kind: "alphafold"; uniprotStart?: number; uniprotEnd?: number }
  | { proteinAccession: string; kind: "pdb"; mappings: readonly Mapping[] };

type ResidueInterval = { start: number; end: number; chain: string; labelChain: boolean };
type ColorCache = {
  data: ActiveSiteData | undefined;
  mapping: ActiveSiteMapping | undefined;
  residues: Set<number>;
  version: number;
};

const mappings = new WeakMap<Model, ActiveSiteMapping>();
const caches = new WeakMap<Model, ColorCache>();
let nextVersion = 0;

export function setActiveSiteMapping(model: Model, mapping: ActiveSiteMapping | undefined): void {
  if (mapping) mappings.set(model, mapping);
  else mappings.delete(model);
  caches.delete(model);
}

const contains = (ranges: readonly ActiveSiteRange[], position: number) =>
  ranges.some(({ start, end }) => position >= start && position <= end);

const validPosition = (position: number) => Number.isInteger(position) && position > 0;

function getPdbIntervals(mapping: Extract<ActiveSiteMapping, { kind: "pdb" }>, ranges: readonly ActiveSiteRange[]): ResidueInterval[] {
  const intervals: ResidueInterval[] = [];
  for (const segment of mapping.mappings || []) {
    const start = segment.start?.residue_number;
    const end = segment.end?.residue_number;
    const unpStart = segment.unp_start;
    const unpEnd = segment.unp_end;
    if (![start, end, unpStart, unpEnd].every(validPosition)
      || end < start || unpEnd < unpStart || end - start !== unpEnd - unpStart) continue;

    const labelChain = Boolean(segment.struct_asym_id);
    const chain = labelChain ? segment.struct_asym_id : segment.chain_id;
    if (!chain) continue;
    for (const range of ranges) {
      const overlapStart = Math.max(range.start, unpStart);
      const overlapEnd = Math.min(range.end, unpEnd);
      if (overlapStart > overlapEnd) continue;
      // Intersect each mapping segment separately: gaps must never acquire color.
      intervals.push({
        start: start + overlapStart - unpStart,
        end: start + overlapEnd - unpStart,
        chain,
        labelChain,
      });
    }
  }
  return intervals;
}

function collectActiveResidues(model: Model, data: ActiveSiteData | undefined, mapping: ActiveSiteMapping | undefined): Set<number> {
  const selected = new Set<number>();
  if (!data?.ranges.length || !mapping || !data.proteinAccession
    || data.proteinAccession.trim().toUpperCase() !== mapping.proteinAccession.trim().toUpperCase()) return selected;

  const { residues, residueAtomSegments, chainAtomSegments, chains } = model.atomicHierarchy;
  const positions: Array<{ residue: number; position: number }> = [];
  for (let residue = 0; residue < residues._rowCount; residue++) {
    if (residues.label_seq_id.valueKind(residue) !== 0) continue;
    const position = residues.label_seq_id.value(residue);
    if (validPosition(position)) positions.push({ residue, position });
  }

  if (mapping.kind === "alphafold") {
    const start = validPosition(mapping.uniprotStart as number) ? mapping.uniprotStart! : 1;
    const end = validPosition(mapping.uniprotEnd as number) && mapping.uniprotEnd! >= start
      ? mapping.uniprotEnd : undefined;
    // Match the pLDDT fragment-numbering convention using all modeled residues.
    const alreadyUniProt = positions.every(({ position }) => position >= start && (end == null || position <= end));
    const offset = alreadyUniProt ? 0 : start - 1;
    for (const { residue, position } of positions) {
      const uniprotPosition = position + offset;
      if (uniprotPosition >= start && (end == null || uniprotPosition <= end)
        && contains(data.ranges, uniprotPosition)) selected.add(residue);
    }
  } else {
    const intervals = getPdbIntervals(mapping, data.ranges);
    for (const { residue, position } of positions) {
      const atom = residueAtomSegments.offsets[residue];
      const chain = chainAtomSegments.index[atom];
      if (intervals.some(interval => position >= interval.start && position <= interval.end
        && (interval.labelChain ? chains.label_asym_id.value(chain) : chains.auth_asym_id.value(chain)) === interval.chain)) {
        selected.add(residue);
      }
    }
  }
  return selected;
}

function getCache(model: Model): ColorCache {
  const data = getActiveSiteData(model);
  const mapping = mappings.get(model);
  const cached = caches.get(model);
  if (cached && cached.data === data && cached.mapping === mapping) return cached;
  const next = { data, mapping, residues: collectActiveResidues(model, data, mapping), version: ++nextVersion };
  caches.set(model, next);
  return next;
}

/** Changing annotations or mapping invalidates Mol*'s theme equality cache. */
export function getActiveSiteColorVersion(model: Model): number {
  return getCache(model).version;
}

/** Cached residue membership avoids scanning the annotation ranges for every atom. */
export function isActiveSiteAtom(model: Model, atomIndex: number): boolean {
  if (!Number.isInteger(atomIndex) || atomIndex < 0 || atomIndex >= model.atomicHierarchy.atoms._rowCount) return false;
  return getCache(model).residues.has(model.atomicHierarchy.residueAtomSegments.index[atomIndex]);
}
