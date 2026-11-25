import { extractPlddtScores, getPlddtColor } from "../plddt";

const column = (values, missing = []) => ({
  isDefined: true,
  value: index => values[index],
  valueKind: index => missing.includes(index) ? 1 : 0,
});

const makeModel = (positions, scores, { atoms, offsets, missing = [] } = {}) => ({
  atomicHierarchy: {
    atoms: { label_atom_id: column(atoms || positions.map(() => "CA")) },
    residues: { _rowCount: positions.length, label_seq_id: column(positions) },
    residueAtomSegments: { offsets: offsets || positions.map((_, index) => index).concat(positions.length) },
  },
  atomicConformation: { B_iso_or_equiv: column(scores, missing) },
  // LiP injection may replace these metrics, so confidence must come from atoms.
  _staticPropertyData: { ma_quality_assessment: { data: { value: { localMetrics: new Map([[0, 3]]) } } } },
});

describe("pLDDT structure colors", () => {
  it("matches the barcode palette at all confidence boundaries", () => {
    for (const [score, color] of [
      [0, 0xff7d45], [49.99, 0xff7d45],
      [50, 0xffdb13], [69.99, 0xffdb13],
      [70, 0x65cbf3], [90, 0x65cbf3],
      [90.01, 0x0053d6], [100, 0x0053d6],
      [null, 0xaaaaaa], [undefined, 0xaaaaaa],
      [-1, 0xaaaaaa], [101, 0xaaaaaa], [NaN, 0xaaaaaa], [Infinity, 0xaaaaaa],
    ]) expect(getPlddtColor(score, true)).toBe(color);
  });

  it("does not interpret experimental B-factors as prediction confidence", () => {
    for (const bFactor of [0, 20, 50, 70, 90, 99]) {
      expect(getPlddtColor(bFactor, false)).toBe(0xaaaaaa);
    }
  });
});

describe("AlphaFold pLDDT extraction", () => {
  it("reads one C-alpha confidence per residue from the original atomic column", () => {
    const model = makeModel([1, 2], [10, 72.69, 30, 91.94, 40], {
      atoms: ["N", "CA", "C", "CA", "CB"],
      offsets: [0, 3, 5],
    });
    expect(extractPlddtScores(model)).toEqual([
      { position: 1, score: 72.69 },
      { position: 2, score: 91.94 },
    ]);
  });

  it("preserves valid zero/100 confidence and omits missing or invalid values", () => {
    const model = makeModel([1, 2, 3, 4, 5, 6, 7], [0, 100, -1, 101, NaN, Infinity, 0], { missing: [6] });
    expect(extractPlddtScores(model)).toEqual([
      { position: 1, score: 0 },
      { position: 2, score: 100 },
    ]);
    model.atomicConformation.B_iso_or_equiv.isDefined = false;
    expect(extractPlddtScores(model)).toEqual([]);
    expect(extractPlddtScores(undefined)).toEqual([]);
  });

  it("omits residues without C-alpha atoms and deduplicates sequence positions", () => {
    const model = makeModel([1, 2, 2], [90, 80, 70], { atoms: ["N", "CA", "CA"] });
    expect(extractPlddtScores(model)).toEqual([{ position: 2, score: 80 }]);
  });

  it("maps model-local fragment numbering into UniProt positions", () => {
    expect(extractPlddtScores(makeModel([1, 2], [95, 80]), 201, 202)).toEqual([
      { position: 201, score: 95 },
      { position: 202, score: 80 },
    ]);
  });

  it("preserves fragment numbering that is already in UniProt coordinates", () => {
    expect(extractPlddtScores(makeModel([201, 202], [95, 80]), 201, 202)).toEqual([
      { position: 201, score: 95 },
      { position: 202, score: 80 },
    ]);
  });

  it("determines fragment numbering from all residues, including missing confidence", () => {
    expect(extractPlddtScores(makeModel([1, 2, 3], [NaN, NaN, 90]), 2, 4)).toEqual([
      { position: 4, score: 90 },
    ]);
  });
});
