import { PropertyValueMap } from "lit";
import { Heatmap } from "heatmap-component";
import NightingaleElement from "@nightingale-elements/nightingale-new-core";
interface HotmapData {
    xValue: number;
    yValue: string;
    score: number;
    [key: string]: unknown;
}
declare const NightingaleSequenceHeatmap_base: import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withZoom").WithZoomInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withResizable").WithResizableInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withMargin").withMarginInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withPosition").withPositionInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withDimensions").WithDimensionsInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withHighlight").WithHighlightInterface> & typeof NightingaleElement;
declare class NightingaleSequenceHeatmap extends NightingaleSequenceHeatmap_base {
    /**
     * Mandatory field in order for heatmap component to work properly
     */
    "heatmap-id": string;
    "hm-highlight-width": number;
    "use-ctrl-to-zoom": false;
    heatmapDomainX?: number[];
    heatmapDomainY?: string[];
    heatmapData?: HotmapData[];
    heatmapInstance?: Heatmap<number, string, HotmapData>;
    firstZoom: boolean;
    connectedCallback(): void;
    /**
     * Nightingale lifecycle function that runs before zoomRefreshed
     * needs to be overriden so zoomRefreshed works since it's svg coupled
     * (see withZoom)
     */
    applyZoomTranslation(): void;
    /**
     * Nightingale lifecycle function to update zooming (see withZoom)
     */
    zoomRefreshed(): void;
    /**
     * Nightingale lifecycle function to update highlight (see withHighlight)
     * has to be manually triggered from render (zoomRefreshed and updated in this case)
     */
    protected updateHighlight(): void;
    /**
     * Render function
     *
     * Heatmap-components styles are injected here as a typescript variable
     * (necessary to avoid changing rollup build configs)
     *
     * @returns lit-html to render for this component
     */
    render(): import("lit-html").TemplateResult<1>;
    /**
     * Function runs after whole lit element update cycle is done
     * Here we bind heatmap events in case a heatmap instance does not exist
     */
    updated(_changedProperties: PropertyValueMap<unknown> | Map<PropertyKey, unknown>): void;
    /**
     * Main function accessed by the user in order to render heatmap visualization
     * @param xDomain int[]: list of 1-indexed resid ids for each residue number
     * @param yDomain string[]: list of heatmap row categories
     * @param data array of objects containing some mandatory fields: xValue (resid id), yValue (row categ) and score (float value mapped to color)
     */
    setHeatmapData(xDomain: number[], yDomain: string[], data: HotmapData[]): void;
    /**
     * Creates random data (useful for testing) base on a given
     * sequence length
     */
    createRandomFromLength(): void;
    /**
     * Main heatmap rendering function. Should only be triggered once
     * Necessary to bind zoom and hover events between Heatmap component and Nightingale
     */
    renderHeatmap(): void;
    /**
     * Function to bind zoom and hover events between Heatmap component and Nightingale
     */
    bindHeatmapEvents(): void;
    /**
     * Function to trigger Heatmap zooming from Nightingale
     */
    triggerHeatmapZoom(): void;
    /**
     * Function to trigger Heatmap highlighting from Nightingale
     */
    triggerHeatmapHighlight(): void;
}
export default NightingaleSequenceHeatmap;
//# sourceMappingURL=nightingale-sequence-heatmap.d.ts.map