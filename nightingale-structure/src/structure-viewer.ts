/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "molstar/lib/mol-util/polyfill";
import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import {
  StructureElement,
  StructureProperties,
  StructureSelection,
} from "molstar/lib/mol-model/structure";
import { PluginLayoutControlsDisplay } from "molstar/lib/mol-plugin/layout";
import { Script } from "molstar/lib/mol-script/script";
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { Color } from "molstar/lib/mol-util/color";
import { ValueBox } from "molstar/lib/mol-util/value-cell";
import { ChainIdColorThemeProvider } from "molstar/lib/mol-theme/color/chain-id";

import {LIPColorTheme} from './color_new';
import { extractPlddtScores, PlddtScore } from './plddt';
import { markAlphaFoldModels, PlddtColorThemeProvider } from './color-plddt';
import { createZoomOutClippingTracker, getZoomSnapshot } from './camera';



interface CustomPluginState {
  lipscoreArray: Array<number>;
}

class CustomPluginContext extends PluginContext {
  customState: CustomPluginState;

  constructor(spec: any) {
    super(spec);
    this.customState = {
      lipscoreArray: [],
    };
  }
}

const viewerOptions = {
  layoutIsExpanded: false,
  layoutShowControls: false,
  layoutShowRemoteState: false,
  layoutControlsDisplay: "reactive" as PluginLayoutControlsDisplay,
  layoutShowSequence: false,
  layoutShowLog: false,
  layoutShowLeftPanel: false,
  disableAntialiasing: false,
  pixelScale: 1,
  enableWboit: false,
  viewportShowExpand: true,
  viewportShowSelectionMode: false,
  viewportShowAnimation: false,
  pdbProvider: "pdbe",
  viewportShowControls: PluginConfig.Viewport.ShowControls.defaultValue,
  viewportShowSettings: PluginConfig.Viewport.ShowSettings.defaultValue,
};



const defaultSpec = DefaultPluginSpec(); // TODO: Make our own to select only essential plugins
const spec: PluginSpec = {
  actions: defaultSpec.actions,
  behaviors: [
    ...defaultSpec.behaviors,
  ],
  layout: {
    initial: {
      isExpanded: viewerOptions.layoutIsExpanded,
      showControls: viewerOptions.layoutShowControls,
      controlsDisplay: viewerOptions.layoutControlsDisplay,
    },
  },
  config: [
    [
      PluginConfig.General.DisableAntialiasing,
      viewerOptions.disableAntialiasing,
    ],
    [PluginConfig.General.PixelScale, viewerOptions.pixelScale],
    [PluginConfig.General.EnableWboit, viewerOptions.enableWboit],
    [PluginConfig.Viewport.ShowExpand, viewerOptions.viewportShowExpand],
    [
      PluginConfig.Viewport.ShowSelectionMode,
      viewerOptions.viewportShowSelectionMode,
    ],
    [PluginConfig.Download.DefaultPdbProvider, viewerOptions.pdbProvider],
    [
      PluginConfig.Structure.DefaultRepresentationPresetParams,
      {
        theme: {
          globalName: "af-confidence",
          carbonByChainId: false,
          focus: {
            name: "element-symbol",
            params: { carbonByChainId: false },
          },
        },
      },
    ],
  ],
};

type SequencePosition = { chain: string; position: number };
type Range = { chain: string; start: number; end: number };
export type StructureColorMode = "lip" | "plddt";

export type StructureViewer = {
  plugin: CustomPluginContext;
  loadPdb(pdb: string, lipscoreArray?: Array<number>): Promise<void>;
  loadCifUrl(url: string, lipscoreArray: Array<number>, isBinary?: boolean, isAlphaFold?: boolean): Promise<void>;
  highlight(ranges: Range[]): void;
  clearHighlight(): void;
  changeHighlightColor(color: number): void;
  zoom(factor: number): void;
  handleResize(): void;
  addLiPScores(lipscoreArray: Array<number>): void;
  setColorMode(mode: StructureColorMode): Promise<void>;
  applyColorTheme(): Promise<void>;
  getPlddtScores(uniprotStart?: number, uniprotEnd?: number): PlddtScore[];
};



export const getStructureViewer = async (
  
  container: HTMLDivElement,
  onHighlightClick: (sequencePositions: SequencePosition[]) => void,
  lipscoreArray: Array<number>,
  colorTheme?: string
): Promise<StructureViewer> => {
  const spec: PluginSpec = DefaultPluginSpec(); // Adjust this based on your specific plugin requirements
  const plugin = new CustomPluginContext(spec); // Use your custom context
  await plugin.init();

  const canvas = container.querySelector<HTMLCanvasElement>("canvas");

  if (!canvas || !plugin.initViewer(canvas, container)) {
    throw new Error("Failed to init Mol*");
  }

  const canvas3d = plugin.canvas3d!;
  const getZoomOutClipping = createZoomOutClippingTracker(canvas3d.camera);
  canvas3d.didDraw.subscribe(() => {
    const camera = canvas3d.camera;
    const clipping = getZoomOutClipping(canvas3d.boundingSphereVisible);
    if (!clipping || canvas3d.boundingSphere.radius <= 0) return;

    // Mol* resets radiusMax on scene commits, so retain the recovered depth
    // across color changes too. This also handles wheel and gesture zoom-out.
    const sceneRadiusFactor = Math.max(canvas3d.props.sceneRadiusFactor,
      clipping.radiusMax / canvas3d.boundingSphere.radius);
    if (sceneRadiusFactor > canvas3d.props.sceneRadiusFactor) canvas3d.setProps({ sceneRadiusFactor });
    camera.setState(clipping);
    canvas3d.requestDraw();
  });

  if (LIPColorTheme.colorThemeProvider)
    plugin.representation.structure.themes.colorThemeRegistry.add(
      LIPColorTheme.colorThemeProvider
    );
  if (LIPColorTheme.labelProvider)
    plugin.managers.lociLabels.addProvider(
      LIPColorTheme.labelProvider
    );
  plugin.customModelProperties.register(
    LIPColorTheme.propertyProvider,
    true
  );
  plugin.representation.structure.themes.colorThemeRegistry.add(PlddtColorThemeProvider);
  let colorMode: StructureColorMode = "lip";
  let colorThemeTask: Promise<void> = Promise.resolve();


plugin.behaviors.interaction.click.subscribe((event) => {
  if (StructureElement.Loci.is(event.current.loci)) {
    const loc = StructureElement.Location.create();
    StructureElement.Loci.getFirstLocation(event.current.loci, loc);
    const sequencePosition = StructureProperties.residue.label_seq_id(loc);
    const chain = StructureProperties.chain.auth_asym_id(loc);
    onHighlightClick([{ position: sequencePosition, chain: chain }]);
  }
});


PluginCommands.Canvas3D.SetSettings(plugin, {
  settings: ({ renderer, marking }) => {
    renderer.backgroundColor = Color(0xffffff);
    // For highlight
    marking.edgeScale = 1.5;
    renderer.selectStrength = 0;
    // For hover
    renderer.highlightStrength = 1;
    renderer.backgroundColor = Color(0xffffff); // Set background to white
    renderer.pickingAlphaThreshold = 0.5; // Adjust picking alpha threshold

   
  },
});

const structureViewer: StructureViewer = {
  plugin,
  getPlddtScores(uniprotStart = 1, uniprotEnd) {
    const model = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data.models[0];
    return extractPlddtScores(model, uniprotStart, uniprotEnd);
  },
  async loadPdb(pdb, lipscoreArray: Array<number> = []) {
    await this.loadCifUrl(
      `https://www.ebi.ac.uk/pdbe/model-server/v1/${pdb.toLowerCase()}/full?encoding=bcif`,
      lipscoreArray,
      true
    );
  },
  async loadCifUrl(url:string, lipscoreArray:Array<number> = [], isBinary:boolean = false, isAlphaFold:boolean = false): Promise<void> {
    plugin.customState.lipscoreArray = lipscoreArray || [];
    const data = await plugin.builders.data.download(
      { url, isBinary },
      { state: { isGhost: true } }
    );
    const trajectory = await plugin.builders.structure.parseTrajectory(
      data,
      "mmcif"
    );

    await plugin.builders.structure.hierarchy.applyPreset(
      trajectory,
      "all-models",
      { useDefaultIfSingleModel: true }
    );

    for (const structure of plugin.managers.structure.hierarchy.current.structures) {
      const models = structure.cell.obj?.data.models;
      if (models) markAlphaFoldModels(models, isAlphaFold);
    }
    this.addLiPScores(plugin.customState.lipscoreArray);
    await this.applyColorTheme();
    // TODO maybe add here more logic
  },
  addLiPScores(lipscoreArray: Array<number>) {
    plugin.customState.lipscoreArray = lipscoreArray || [];
    const structureData = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if(!structureData){
      return;
    }
  
    const lipScoresMap = new Map();
    lipscoreArray.forEach((score, index) => {
      lipScoresMap.set(index, score);
    });
  
    // Mol* exposes all models parsed from the loaded structure file here.
    // In our current usage (AlphaFold and the typical PDB entries we show),
    // the first item is the main/usually only protein model, so we attach the
    // LiP score data to models[0]. Extra entries would only appear for true
    // multi-model files such as NMR ensembles.
    const modelData = structureData.models?.[0]._staticPropertyData;
    if (!modelData) {
      console.error("Model data is missing in the structure data.");
      return structureData;
    }
  
    // Initialize ma_quality_assessment if it doesn't exist
    modelData.ma_quality_assessment = modelData.ma_quality_assessment || { data: { value: { lipScore: undefined, localMetrics: undefined } } };
    modelData.ma_quality_assessment.data = modelData.ma_quality_assessment.data || { value: { lipScore: undefined, localMetrics: undefined } };
    modelData.ma_quality_assessment.data.value = modelData.ma_quality_assessment.data.value || { lipScore: undefined, localMetrics: undefined };
    modelData.ma_quality_assessment.data.value.localMetrics = modelData.ma_quality_assessment.data.value.localMetrics || new Map();

    // Assign the LiP scores map
    modelData.ma_quality_assessment.data.value.lipScore = lipScoresMap;
    modelData.ma_quality_assessment.data.value.localMetrics = lipScoresMap;

    const model = structureData.models?.[0];
    const lipPropertyName = LIPColorTheme.propertyProvider.descriptor.name;
    const lipPropertyContainer = model?._dynamicPropertyData?.[lipPropertyName]
      ?? model?._staticPropertyData?.[lipPropertyName];
    if (lipPropertyContainer?.data && model) {
      const residueIndex = model.atomicHierarchy.residueAtomSegments.index;
      const label_seq_id = model.atomicHierarchy.residues.label_seq_id;
      const residueRowCount = model.atomicHierarchy.atoms._rowCount;

      const lipMap = new Map();
      for (let i = 0; i < residueRowCount; i++) {
        const resId = residueIndex[i];
        const seqId = label_seq_id.value(resId) as number;
        const score = lipScoresMap.get(seqId - 1);
        lipMap.set(i, score !== undefined ? score : 0);
      }

      lipPropertyContainer.data = ValueBox.withValue(
        lipPropertyContainer.data,
        lipMap
      );
    }

    console.log('LiP scores successfully added to structure data.');
    console.log('Updated structure data:', JSON.stringify(modelData, null, 2));
  },

  setColorMode(mode) {
    colorMode = mode;
    return this.applyColorTheme();
  },
  applyColorTheme() {
    colorThemeTask = colorThemeTask.catch(() => undefined).then(() => plugin.dataTransaction(async () => {
      const themeName = colorMode === "plddt"
        ? PlddtColorThemeProvider.name : LIPColorTheme.propertyProvider.descriptor.name;
      for (const structure of plugin.managers.structure.hierarchy.current.structures || []) {
        if (!structure?.components?.length) {
          continue;
        }

        await plugin.managers.structure.component.updateRepresentationsTheme(
          structure.components,
          {
            color: themeName as typeof ChainIdColorThemeProvider.name,
          }
        );
      }
    }));
    return colorThemeTask;
  },
  
  
    

  highlight(ranges) {
    // What nightingale calls "highlight", mol* calls "select"
    // The query in this method is over label_seq_id so the provided start & end
    // coordinates must be in PDB space
    const data =
      plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj
        ?.data;
    if (!data) {
      return;
    }
    const sel = Script.getStructureSelection(
      (Q) =>
        Q.struct.generator.atomGroups({
          "residue-test": Q.core.logic.or(
            ranges.map(({ start, end, chain }) =>
              Q.core.logic.and([
                Q.core.rel.inRange([
                  Q.struct.atomProperty.macromolecular.label_seq_id(),
                  start,
                  end,
                ]),
                Q.core.rel.eq([
                  Q.struct.atomProperty.macromolecular.auth_asym_id(),
                  chain,
                ]),
              ])
            )
          ),
        }),
      data
    );
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.camera.focusLoci(loci);
    plugin.managers.interactivity.lociSelects.selectOnly({ loci });
  },
  clearHighlight() {
    plugin.managers.interactivity.lociSelects.deselectAll();
    PluginCommands.Camera.Reset(plugin, {});
  },
  changeHighlightColor(color: number) {
    PluginCommands.Canvas3D.SetSettings(plugin, {
      settings: ({ renderer, marking }) => {
        // For highlight
        marking.selectEdgeColor = Color(color);
        // For hover
        marking.highlightEdgeColor = Color(color);
        renderer.highlightColor = Color(color);
      },
    });
  },

  zoom(factor: number) {
    const camera = plugin.canvas3d?.camera;
    if (!camera) return;
    const snapshot = getZoomSnapshot(camera.getSnapshot(), factor);
    if (snapshot) camera.setState(snapshot, 150);
  },

  handleResize() {
    plugin.layout.events.updated.next(null);
  },
};
  return structureViewer;
};
