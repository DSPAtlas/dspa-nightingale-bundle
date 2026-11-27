import "molstar/lib/mol-util/polyfill";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PlddtScore } from './plddt';
import { ActiveSiteData } from './active-sites';
import { ActiveSiteMapping } from './active-site-color';
interface CustomPluginState {
    lipscoreArray: Array<number>;
    activeSiteData: ActiveSiteData;
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
export type StructureColorMode = "lip" | "plddt";
export type StructureViewer = {
    plugin: CustomPluginContext;
    loadPdb(pdb: string, lipscoreArray?: Array<number>, activeSiteMapping?: ActiveSiteMapping): Promise<void>;
    loadCifUrl(url: string, lipscoreArray: Array<number>, isBinary?: boolean, isAlphaFold?: boolean, activeSiteMapping?: ActiveSiteMapping): Promise<void>;
    highlight(ranges: Range[]): void;
    clearHighlight(): void;
    changeHighlightColor(color: number): void;
    zoom(factor: number): void;
    handleResize(): void;
    addLiPScores(lipscoreArray: Array<number>): void;
    setActiveSiteRanges(proteinAccession: string, ranges: unknown): Promise<void>;
    setColorMode(mode: StructureColorMode): Promise<void>;
    applyColorTheme(): Promise<void>;
    getPlddtScores(uniprotStart?: number, uniprotEnd?: number): PlddtScore[];
};
export declare const getStructureViewer: (container: HTMLDivElement, onHighlightClick: (sequencePositions: SequencePosition[]) => void, lipscoreArray: Array<number>, colorTheme?: string) => Promise<StructureViewer>;
export {};
//# sourceMappingURL=structure-viewer.d.ts.map