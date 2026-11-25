/* eslint-disable class-methods-use-this */
import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import NightingaleElement, {
  withHighlight,
  withManager,
  customElementOnce,
} from "@nightingale-elements/nightingale-new-core";

import { getStructureViewer, StructureViewer } from "./structure-viewer";
import type { PlddtData, PlddtScore } from "./plddt";
export type { PlddtData, PlddtScore } from "./plddt";
import translatePositions, {
  PositionMappingError,
  Mapping,
  TranslatedPosition,
} from "./position-mapping";

/*
  TODO:
  [ ] Molstar/Mol* data fetching optimizations - create query to fetch only what is needed from model server, caching https://www.ebi.ac.uk/panda/jira/browse/TRM-26073
  [ ] Molstar/Mol* bundle optimizations - only load the plugins that are absolutely needed https://www.ebi.ac.uk/panda/jira/browse/TRM-26074
  [ ] Change highlight color in Mol* https://www.ebi.ac.uk/panda/jira/browse/TRM-26075
*/

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

export type PDBData = Record<
  string,
  {
    UniProt: Record<
      string,
      {
        identifier: string;
        name: string;
        mappings: Mapping[];
      }
    >;
  }
>;

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

const uniProtMappingUrl = "https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/";

const alphaFoldMappingUrl = "https://alphafold.ebi.ac.uk/api/prediction/";

@customElementOnce("nightingale-structure")
class NightingaleStructure extends withManager(
  withHighlight(NightingaleElement),
) {

  @property({ type: String })
  "protein-accession"?: string;

  @property({ type: String })
  "structure-id": string;

  @property({ type: String })
  "custom-download-url"?: string;

  @property({ type: Array})
   "lipscore-array": Array<number>;

  @state()
  selectedMolecule?: {
    id: string;
    mappings?: Mapping[];
  };

  @state()
  message?: { title: string; content: string } | null = {
    title: "title",
    content: "message",
  };

  #structureViewer?: StructureViewer;
  #structureViewerReady?: Promise<StructureViewer | undefined>;
  #selectionVersion = 0;
  #selectionTask: Promise<void> = Promise.resolve();
  #plddtData: PlddtData | null = null;

  get plddtData(): PlddtData | null {
    return this.#plddtData;
  }

  private publishPlddt(proteinAccession: string, structureId: string, scores: PlddtScore[]) {
    this.#plddtData = { proteinAccession, structureId, scores };
    this.dispatchEvent(new CustomEvent<PlddtData>("plddt-change", {
      detail: this.#plddtData,
      bubbles: true,
      composed: true,
    }));
  }

  constructor() {
    super();
    this.updateHighlight = this.updateHighlight.bind(this);
  }

  private zoomIn = () => {
    this.#structureViewer?.zoom(0.8);
  };

  private zoomOut = () => {
    this.#structureViewer?.zoom(1.25);
  };

  protected render() {
    return html`<style>
        nightingale-structure {
          width: 100%;
        }

        .structure-viewer-container {
          position: relative;
          height: var(--custom-structure-height, 480px);
        }

        .structure-viewer-messages {
          opacity: 0.75;
          position: absolute;
          right: 0;
          bottom: 0;
          border: 1px solid gray;
          padding: 1ch;
        }

        .structure-viewer-messages > *:first-child {
          font-weight: bold;
        }

        .structure-viewer-messages > button {
          font-size: 50%;
          font-weight: bold;
          margin-inline-start: 1ch;
        }

        .structure-viewer-zoom-controls {
          position: absolute;
          right: 1rem;
          bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 1;
        }

        .structure-viewer-zoom-controls button {
          width: 2.25rem;
          height: 2.25rem;
          border: 1px solid gray;
          border-radius: 0.25rem;
          background: rgba(255, 255, 255, 0.9);
          color: #222;
          font-size: 1.25rem;
          font-weight: bold;
          cursor: pointer;
          line-height: 1;
        }

        .structure-viewer-zoom-controls button:hover {
          background: rgba(255, 255, 255, 1);
        }
      </style>
      <div id="molstar-parent" class="structure-viewer-container">
        <canvas
          id="molstar-canvas"
          style="position: absolute; top: 0; left: 0; right: 0; bottom: 0"
        ></canvas>
        <div class="structure-viewer-zoom-controls">
          <button type="button" title="Zoom in" @click="${this.zoomIn}">+</button>
          <button type="button" title="Zoom out" @click="${this.zoomOut}">−</button>
        </div>
        ${this.message
          ? html`<div class="structure-viewer-messages">
              <span>${this.message?.title}:</span> ${this.message?.content}
              <button
                type="button"
                title="close message"
                @click="${this.clearMessage}"
              >
                x
              </button>
            </div> `
          : nothing}
      </div>`;
  }

  
  protected firstUpdated() {
    const structureViewerDiv = this.renderRoot.querySelector<HTMLDivElement>("#molstar-parent");
    
    if (structureViewerDiv) {
      console.log('Structure Viewer container found:', structureViewerDiv);
  
      const lipscoreArray = this["lipscore-array"]; //this.lipscoreArray || [];
      console.log('LipScore Array:', lipscoreArray);
  
      this.#structureViewerReady = getStructureViewer(structureViewerDiv, this.updateHighlight, lipscoreArray).then(
        (structureViewer) => {
          if (!this.isConnected) {
            structureViewer.plugin.dispose();
            return undefined;
          }
          this.#structureViewer = structureViewer;
          const color = this["highlight-color"]?.substring(1, 7) || "FF6699";
          this.#structureViewer.changeHighlightColor(parseInt(color, 16));
          return structureViewer;
        })
        .catch((error) => {
          console.error('Error initializing structure viewer:', error);
          return undefined;
        });
    } else {
      console.error('#molstar-parent not found');
    }
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("structure-id") || changedProperties.has("protein-accession")) {
      this.selectMolecule();
    }
    if (changedProperties.has("lipscore-array") && !changedProperties.has("structure-id")) {
      const lipscoreArray = this["lipscore-array"] || [];
      this.#structureViewer?.addLiPScores(lipscoreArray);
      this.#structureViewer?.applyLipColorTheme()?.catch(console.error);
    }
    if (
      changedProperties.has("highlight") ||
      changedProperties.has("selectedMolecule")
    ) {
      this.highlightChain();
    }
    if (changedProperties.has("highlight-color")) {
      const color = this["highlight-color"].substring(1, 7);
      this.#structureViewer?.changeHighlightColor(parseInt(color, 16));
      this.#structureViewer?.handleResize();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#selectionVersion++;
    this.#structureViewer?.plugin.dispose();
  }

  async loadPDBEntry(pdbId: string): Promise<PDBData> {
    this.#structureViewer?.plugin.clear();
    this.showMessage("Loading", pdbId);
    try {
      const response = await fetch(`${uniProtMappingUrl}${pdbId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      this.showMessage("Error", `Couldn't load PDB entry "${pdbId}"`);
      console.error(e);
      throw e;
    }
  }

  async loadAFEntry(id: string): Promise<PredictionData[]> {
    this.#structureViewer?.plugin.clear();
    this.showMessage("Loading", id);
    try {
      const response = await fetch(`${alphaFoldMappingUrl}${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      this.showMessage("Error", `Couldn't load AF entry "${id}"`);
      console.error(e);
      throw e;
    }
  }

  isAF(): boolean {
    return this["structure-id"].startsWith("AF-");
  }

  selectMolecule(): Promise<void> {
    const version = ++this.#selectionVersion;
    const proteinAccession = this["protein-accession"] || "";
    const structureId = this["structure-id"] || "";
    this.publishPlddt(proteinAccession, structureId, []);
    // Mol* loads mutate shared plugin state, so let the latest selection follow
    // any in-flight load; obsolete requests never publish confidence data.
    this.#selectionTask = this.#selectionTask.then(() => this.loadSelectedMolecule(version, proteinAccession, structureId));
    return this.#selectionTask;
  }

  private async loadSelectedMolecule(version: number, proteinAccession: string, structureId: string): Promise<void> {
    const isCurrent = () => this.isConnected && version === this.#selectionVersion;
    const structureViewer = await this.#structureViewerReady;
    if (!isCurrent() || !structureViewer) return;
    if (!structureId || !proteinAccession) {
      console.error('Missing structure-id or protein-accession');
      return;
    }
    
    const lipscoreArray = this["lipscore-array"];   
    console.log("lip array load", lipscoreArray);

    let mappings;
    try {
      if (structureId.startsWith("AF-")) {
        const afPredictions = await this.loadAFEntry(proteinAccession);
        if (!isCurrent()) return;
        const afInfo = afPredictions.find(
          (prediction) => prediction.entryId === structureId,
        );
        if (afInfo?.cifUrl) {
          console.log(afInfo.cifUrl);
          await structureViewer.loadCifUrl(afInfo.cifUrl, lipscoreArray, false);
          if (!isCurrent()) return;
          this.publishPlddt(proteinAccession, structureId, structureViewer.getPlddtScores(afInfo.uniprotStart, afInfo.uniprotEnd));
          this.clearMessage();
        } else {
          this.showMessage("Error", `Could not find AF entry for ${this["structure-id"]}`);
        }
      } else {
        const pdbEntry = await this.loadPDBEntry(structureId);
        if (!isCurrent()) return;
        mappings =
          Object.values(pdbEntry)[0].UniProt[proteinAccession]?.mappings;
          if (this["custom-download-url"]) {
            await structureViewer.loadCifUrl(
              `${this["custom-download-url"]}${structureId.toLowerCase()}.cif`, lipscoreArray
            );
            if (!isCurrent()) return;
            this.clearMessage();
        } else {
          await structureViewer.loadPdb(
            structureId.toLowerCase(),
            lipscoreArray,
          );
          if (!isCurrent()) return;
          this.clearMessage();
        }
      }
    } catch (e) {
      if (!isCurrent()) return;
      this.publishPlddt(proteinAccession, structureId, []);
      console.error('Error selecting molecule:', e);
      // Errors are already displayed via showMessage in loadAFEntry/loadPDBEntry
    }
    if (!isCurrent()) return;
    this.selectedMolecule = {
      id: structureId,
      mappings,
    };
  }

  private showMessage(title: string, content: string, timeoutMs?: number) {
    const message = { title, content };
    this.message = message;
    if (timeoutMs) {
      setTimeout(() => {
        if (this.message === message) {
          this.message = null;
        }
      }, timeoutMs);
    }
  }

  private clearMessage() {
    this.message = null;
  }

  updateHighlight(
    sequencePositions: { chain: string; position: number }[],
  ): void {
    if (
      !sequencePositions?.length ||
      sequencePositions.some((pos) => !Number.isInteger(pos.position))
    ) {
      return;
    }

    let translated: TranslatedPosition[];
    if (this.isAF()) {
      translated = sequencePositions.map((pos) => ({
        start: pos.position,
        end: pos.position,
        entity: 1,
        chain: pos.chain,
      }));
    } else {
      try {
        translated = sequencePositions
          .flatMap((pos) =>
            translatePositions(
              pos.position,
              pos.position,
              "PDB_UP",
              this.selectedMolecule?.mappings,
            ).filter((t) => t.chain === pos.chain),
          )
          .filter(Boolean);
      } catch (error) {
        if (error instanceof PositionMappingError) {
          this.showMessage("Error", error.message);
          return;
        }
        throw error;
      }
    }
    if (!translated.length) {
      this.showMessage("Error", "Residue outside of sequence range");
      return;
    }
    const highlight = translated
      .map((residue) => `${residue.start}:${residue.end}`)
      .join(",");
    this.highlight = highlight;
    const event = new CustomEvent("change", {
      detail: {
        highlight,
      },
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  highlightChain(): void {
    if (!this.highlight) {
      this.#structureViewer?.clearHighlight();
      return;
    }
    let translatedPositions;
    try {
      translatedPositions = this.highlightedRegion.segments
        .flatMap(({ start, end }) => {
          if (this.isAF()) {
            return {
              start,
              end,
              chain: "A",
            };
          }
          return translatePositions(
            start,
            end,
            "UP_PDB",
            this.selectedMolecule?.mappings,
          );
        })
        .filter(Boolean);
    } catch (error) {
      if (error instanceof PositionMappingError) {
        this.#structureViewer?.clearHighlight();
        this.showMessage("Error", error.message);
        return;
      }
      throw error;
    }
    if (!translatedPositions?.length) {
      this.#structureViewer?.clearHighlight();
      return;
    }
    this.#structureViewer?.highlight(translatedPositions);
    this.clearMessage();
  }
}

export default NightingaleStructure;
