import type { Model } from "molstar/lib/mol-model/structure";

export type PlddtScore = { position: number; score: number };

export type PlddtData = {
  proteinAccession: string;
  structureId: string;
  scores: PlddtScore[];
};

/** Read AlphaFold confidence from the original atomic column, not LiP properties. */
export const extractPlddtScores = (
  model: Model | undefined,
  uniprotStart = 1,
  uniprotEnd?: number,
): PlddtScore[] => {
  if (!model?.atomicConformation.B_iso_or_equiv.isDefined) return [];

  const { atoms, residues, residueAtomSegments } = model.atomicHierarchy;
  const confidence = model.atomicConformation.B_iso_or_equiv;
  const scores = new Map<number, number>();
  const positions: number[] = [];

  for (let residue = 0; residue < residues._rowCount; residue++) {
    if (residues.label_seq_id.valueKind(residue) !== 0) continue;
    const position = residues.label_seq_id.value(residue);
    if (!Number.isInteger(position) || position < 1) continue;
    positions.push(position);

    for (
      let atom = residueAtomSegments.offsets[residue];
      atom < residueAtomSegments.offsets[residue + 1];
      atom++
    ) {
      if (atoms.label_atom_id.value(atom) !== "CA" || confidence.valueKind(atom) !== 0) continue;
      const score = confidence.value(atom);
      if (Number.isFinite(score) && score >= 0 && score <= 100 && !scores.has(position)) {
        scores.set(position, score);
      }
      break;
    }
  }

  const start = Number.isInteger(uniprotStart) && uniprotStart > 0 ? uniprotStart : 1;
  const end = Number.isInteger(uniprotEnd) && uniprotEnd! >= start ? uniprotEnd : undefined;
  // Fragment files normally use model-local numbering. Preserve numbering that
  // is already in the API's UniProt interval instead of applying the offset twice.
  const isUniProtNumbering = positions.every(position => position >= start && (end == null || position <= end));
  const offset = isUniProtNumbering ? 0 : start - 1;

  return [...scores].map(([position, score]) => ({ position: position + offset, score }))
    .filter(({ position }) => position >= start && (end == null || position <= end))
    .sort((left, right) => left.position - right.position);
};
