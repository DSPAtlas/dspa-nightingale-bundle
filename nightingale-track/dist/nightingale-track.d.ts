import { Selection } from "d3";
import NightingaleElement from "@nightingale-elements/nightingale-new-core";
import FeatureShape, { Shapes } from "./FeatureShape";
import NonOverlappingLayout from "./NonOverlappingLayout";
import DefaultLayout from "./DefaultLayout";
import { getColorByType } from "./ConfigHelper";
export type FeatureLocation = {
    fragments: Array<{
        start: number;
        end: number;
    }>;
};
type PTM = {
    name: string;
    position: number;
    sources: string[];
    dbReferences: DBReference[];
};
type DBReference = {
    id: string;
    properties: Properties;
};
type Properties = {
    "Pubmed ID": string;
    "PSM Score": string;
    "Dataset ID": string;
    "Site q value": string;
    "Universal Spectrum Id": string;
    "PSM Count (0.05 gFLR)": string;
    "Confidence score": "Gold" | "Silver" | "Bronze";
    "Final site probability": string;
    "Organism part": string;
    Proforma: string;
};
export type Feature = {
    accession: string;
    color?: string;
    fill?: string;
    shape?: Shapes;
    tooltipContent?: string;
    type?: string;
    locations?: Array<FeatureLocation>;
    feature?: Feature;
    start?: number;
    end?: number;
    opacity?: number;
    ptms?: Array<PTM>;
};
declare const NightingaleTrack_base: import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withZoom").WithZoomInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withResizable").WithResizableInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withMargin").withMarginInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withPosition").withPositionInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withDimensions").WithDimensionsInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withHighlight").WithHighlightInterface> & typeof NightingaleElement;
declare class NightingaleTrack extends NightingaleTrack_base {
    #private;
    color?: string | null;
    shape?: string | null;
    layout?: "non-overlapping" | "default";
    protected featureShape: FeatureShape;
    protected layoutObj?: DefaultLayout | NonOverlappingLayout;
    filters: null;
    protected seqG?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    protected highlighted?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    protected margins?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    getLayout(): DefaultLayout;
    connectedCallback(): void;
    static normalizeLocations(data: Feature[]): Feature[];
    processData(data: Feature[]): void;
    set data(data: Feature[]);
    get data(): Feature[];
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    protected showTooltipTrack(event: MouseEvent, f: {
        feature: Feature;
    }): void;
    protected hideTooltipTrack(): void;
    protected getFeatureColor(f: Feature | {
        feature: Feature;
    }): string;
    protected getFeatureFillColor(f: Feature | {
        feature: Feature;
    }): string;
    protected getShape(f: Feature | {
        feature: Feature;
    }): Shapes;
    protected createTrack(): void;
    protected createFeatures(): void;
    private applyFilters;
    refresh(): void;
    protected updateHighlight(): void;
    zoomRefreshed(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export default NightingaleTrack;
export { DefaultLayout };
export { getColorByType };
//# sourceMappingURL=nightingale-track.d.ts.map