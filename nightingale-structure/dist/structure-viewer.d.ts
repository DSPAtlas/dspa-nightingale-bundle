import "molstar/lib/mol-util/polyfill";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
interface CustomPluginState {
    lipscoreArray: Array<number>;
}
declare class CustomPluginContext extends PluginContext {
    customState: CustomPluginState;
    constructor(spec: any);
}
export declare const QualityAssessmentLIPPreset: StructureRepresentationPresetProvider<{
    ignoreHydrogens: boolean | undefined;
    ignoreHydrogensVariant: "all" | "non-polar" | undefined;
    ignoreLight: boolean | undefined;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest" | undefined;
    theme: import("molstar/lib/mol-util/param-definition").ParamDefinition.Normalize<{
        globalName: "uniform" | "occupancy" | "element-index" | "element-symbol" | "hydrophobicity" | "shape-group" | "uncertainty" | "carbohydrate-symbol" | "chain-id" | "operator-name" | "entity-id" | "entity-source" | "model-index" | "structure-index" | "molecule-type" | "polymer-id" | "polymer-index" | "residue-name" | "secondary-structure" | "sequence-id" | "unit-index" | "illustrative" | "trajectory-index" | "operator-hkl" | "partial-charge" | "atom-id" | "volume-value" | "volume-segment" | "external-volume" | undefined;
        globalColorParams: any;
        carbonColor: "element-symbol" | "chain-id" | "operator-name" | undefined;
        symmetryColor: "uniform" | "occupancy" | "element-index" | "element-symbol" | "hydrophobicity" | "shape-group" | "uncertainty" | "carbohydrate-symbol" | "chain-id" | "operator-name" | "entity-id" | "entity-source" | "model-index" | "structure-index" | "molecule-type" | "polymer-id" | "polymer-index" | "residue-name" | "secondary-structure" | "sequence-id" | "unit-index" | "illustrative" | "trajectory-index" | "operator-hkl" | "partial-charge" | "atom-id" | "volume-value" | "volume-segment" | "external-volume" | undefined;
        symmetryColorParams: any;
        focus: import("molstar/lib/mol-util/param-definition").ParamDefinition.Normalize<{
            name: any;
            params: any;
        }> | undefined;
    }> | undefined;
}, {
    components?: undefined;
    representations?: undefined;
} | {
    components: {
        polymer: import("molstar/lib/mol-state").StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Structure, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>> | undefined;
    };
    representations: {
        polymer: import("molstar/lib/mol-state").StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Structure.Representation3D, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>;
    };
} | {
    components: {
        all: import("molstar/lib/mol-state").StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Structure, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>> | undefined;
        branched: undefined;
    };
    representations: {
        all: import("molstar/lib/mol-state").StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Structure.Representation3D, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>;
    };
}>;
type SequencePosition = {
    chain: string;
    position: number;
};
type Range = {
    chain: string;
    start: number;
    end: number;
};
export type StructureViewer = {
    plugin: CustomPluginContext;
    loadPdb(pdb: string): Promise<void>;
    loadCifUrl(url: string, lipscoreArray: Array<number>, isBinary?: boolean): Promise<void>;
    highlight(ranges: Range[]): void;
    clearHighlight(): void;
    changeHighlightColor(color: number): void;
    handleResize(): void;
    addLiPScores(lipscoreArray: Array<number>): void;
};
export declare const getStructureViewer: (container: HTMLDivElement, onHighlightClick: (sequencePositions: SequencePosition[]) => void, lipscoreArray: Array<number>) => Promise<StructureViewer>;
export {};
//# sourceMappingURL=structure-viewer.d.ts.map