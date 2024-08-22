import "molstar/lib/mol-util/polyfill";
import { PluginContext } from "molstar/lib/mol-plugin/context";
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
    plugin: PluginContext;
    loadPdb(pdb: string): Promise<void>;
    loadCifUrl(url: string, isBinary?: boolean): Promise<void>;
    highlight(ranges: Range[]): void;
    clearHighlight(): void;
    changeHighlightColor(color: number): void;
    handleResize(): void;
    addLiPScores(lipScoreArray: Array<number>): void;
};
export declare const getStructureViewer: (container: HTMLDivElement, onHighlightClick: (sequencePositions: SequencePosition[]) => void) => Promise<StructureViewer>;
export {};
//# sourceMappingURL=structure-viewer.d.ts.map