import { createActiveSiteData, setModelActiveSiteData } from "../active-sites";
import { ACTIVE_SITE_COLOR, getActiveSiteColorVersion, isActiveSiteAtom, setActiveSiteMapping } from "../active-site-color";
import { config } from "../../../nightingale-track/src/config";

const column = (values, missing = []) => ({
  value: index => values[index],
  valueKind: index => missing.includes(index) ? 1 : 0,
});

const makeModel = (positions, { residueChains = positions.map(() => 0), labels = ["A"], authors = labels, missing = [] } = {}) => ({
  atomicHierarchy: {
    atoms: { _rowCount: positions.length * 2 },
    residues: { _rowCount: positions.length, label_seq_id: column(positions, missing) },
    residueAtomSegments: {
      offsets: positions.map((_, i) => i * 2).concat(positions.length * 2),
      index: positions.flatMap((_, i) => [i, i]),
    },
    chainAtomSegments: { index: residueChains.flatMap(chain => [chain, chain]) },
    chains: { label_asym_id: column(labels), auth_asym_id: column(authors) },
  },
});

const annotate = (model, ranges, mapping = { proteinAccession: "P00561", kind: "alphafold" }) => {
  setModelActiveSiteData(model, createActiveSiteData("P00561", ranges));
  setActiveSiteMapping(model, mapping);
  return model;
};

const segment = (unpStart, unpEnd, start, end, label = "A", author = label) => ({
  unp_start: unpStart, unp_end: unpEnd,
  start: { residue_number: start }, end: { residue_number: end },
  struct_asym_id: label, chain_id: author,
});

const selectedResidues = model => Array.from({ length: model.atomicHierarchy.residues._rowCount }, (_, i) => i)
  .filter(i => isActiveSiteAtom(model, i * 2));

describe("active-site structure coloring", () => {
  it("uses exactly the annotation track's dark yellow", () => {
    expect(ACTIVE_SITE_COLOR).toBe(Number.parseInt(config.ACT_SITE.color.slice(1), 16));
  });

  it("selects every atom at inclusive single and multi-residue sites", () => {
    const model = annotate(makeModel([1, 2, 3, 4, 5, 6]), [{ start: 2, end: 3 }, { start: 5, end: 5 }]);
    expect(selectedResidues(model)).toEqual([1, 2, 4]);
    expect(isActiveSiteAtom(model, 3)).toBe(true);
    expect(isActiveSiteAtom(model, -1)).toBe(false);
    expect(isActiveSiteAtom(model, 12)).toBe(false);
  });

  it("maps AlphaFold fragment-local positions to UniProt coordinates", () => {
    const model = annotate(makeModel([1, 2, 3, 4]), [{ start: 202, end: 203 }], {
      proteinAccession: "P00561", kind: "alphafold", uniprotStart: 201, uniprotEnd: 204,
    });
    expect(selectedResidues(model)).toEqual([1, 2]);
  });

  it("preserves AlphaFold fragment numbering already in UniProt coordinates", () => {
    const model = annotate(makeModel([201, 202, 203, 204]), [{ start: 202, end: 203 }], {
      proteinAccession: "P00561", kind: "alphafold", uniprotStart: 201, uniprotEnd: 204,
    });
    expect(selectedResidues(model)).toEqual([1, 2]);
  });

  it("ignores missing positions and positions outside the AlphaFold fragment", () => {
    const model = annotate(makeModel([1, 2, 3, 4], { missing: [1] }), [{ start: 201, end: 210 }], {
      proteinAccession: "P00561", kind: "alphafold", uniprotStart: 201, uniprotEnd: 203,
    });
    expect(selectedResidues(model)).toEqual([0, 2]);
  });

  it("uses PDB label residue IDs and label chain IDs, not coincident author IDs", () => {
    const model = annotate(makeModel([10, 11, 10, 11], { residueChains: [0, 0, 1, 1], labels: ["A", "B"], authors: ["X", "A"] }),
      [{ start: 102, end: 102 }], { proteinAccession: "P00561", kind: "pdb", mappings: [segment(101, 102, 10, 11, "A", "X")] });
    expect(selectedResidues(model)).toEqual([1]);
  });

  it("supports author-chain matching when a SIFTS segment omits its label chain", () => {
    const model = annotate(makeModel([10, 11], { labels: ["B"], authors: ["X"] }), [{ start: 102, end: 102 }], {
      proteinAccession: "P00561", kind: "pdb", mappings: [segment(101, 102, 10, 11, "", "X")],
    });
    expect(selectedResidues(model)).toEqual([1]);
  });

  it("clips partial overlaps and does not bridge gaps between PDB mapping segments", () => {
    const model = annotate(makeModel([10, 11, 12, 13, 14, 15]), [{ start: 100, end: 107 }], {
      proteinAccession: "P00561", kind: "pdb", mappings: [segment(101, 102, 10, 11), segment(106, 108, 13, 15)],
    });
    expect(selectedResidues(model)).toEqual([0, 1, 3, 4]);
  });

  it("colors all mapped copies but skips invalid or unavailable mappings", () => {
    const model = annotate(makeModel([10, 10, 10], { residueChains: [0, 1, 2], labels: ["A", "B", "C"] }), [{ start: 101, end: 101 }], {
      proteinAccession: "P00561", kind: "pdb", mappings: [segment(101, 101, 10, 10, "A"), segment(101, 101, 10, 10, "B"), segment(101, 102, 10, 12, "C")],
    });
    expect(selectedResidues(model)).toEqual([0, 1]);
    setActiveSiteMapping(model, { proteinAccession: "P00561", kind: "pdb", mappings: [] });
    expect(selectedResidues(model)).toEqual([]);
    setActiveSiteMapping(model, undefined);
    expect(selectedResidues(model)).toEqual([]);
  });

  it("never applies another protein's annotations to the current structure", () => {
    const model = annotate(makeModel([1, 2]), [{ start: 1, end: 2 }], { proteinAccession: "OTHER", kind: "alphafold" });
    expect(selectedResidues(model)).toEqual([]);
  });

  it("refreshes residue membership and color version on annotation updates and clearing", () => {
    const model = annotate(makeModel([1, 2, 3]), [{ start: 1, end: 1 }]);
    const firstVersion = getActiveSiteColorVersion(model);
    expect(selectedResidues(model)).toEqual([0]);
    expect(getActiveSiteColorVersion(model)).toBe(firstVersion);
    setModelActiveSiteData(model, createActiveSiteData("P00561", [{ start: 3, end: 3 }]));
    expect(getActiveSiteColorVersion(model)).not.toBe(firstVersion);
    expect(selectedResidues(model)).toEqual([2]);
    setModelActiveSiteData(model, createActiveSiteData("P00561", []));
    expect(selectedResidues(model)).toEqual([]);
  });
});
