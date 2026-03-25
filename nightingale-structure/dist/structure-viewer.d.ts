import "molstar/lib/mol-util/polyfill";
import { PluginContext } from "molstar/lib/mol-plugin/context";
interface CustomPluginState {
    lipscoreArray: Array<number>;
}
declare class CustomPluginContext extends PluginContext {
    customState: CustomPluginState;
    constructor(spec: any);
}
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
    loadPdb(pdb: string, lipscoreArray?: Array<number>): Promise<void>;
    loadCifUrl(url: string, lipscoreArray: Array<number>, isBinary?: boolean): Promise<void>;
    highlight(ranges: Range[]): void;
    clearHighlight(): void;
    changeHighlightColor(color: number): void;
    zoom(factor: number): void;
    handleResize(): void;
    addLiPScores(lipscoreArray: Array<number>): void;
    applyLipColorTheme(): Promise<void>;
};
export declare const getStructureViewer: (container: HTMLDivElement, onHighlightClick: (sequencePositions: SequencePosition[]) => void, lipscoreArray: Array<number>, colorTheme?: string) => Promise<StructureViewer>;
export {};
//# sourceMappingURL=structure-viewer.d.ts.map