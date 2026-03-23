import { Selection } from "d3";
import NightingaleElement from "@nightingale-elements/nightingale-new-core";
export type SequenceBaseType = {
    position: number;
    aa: string;
};
declare const NightingaleSequence_base: import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withZoom").WithZoomInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withResizable").WithResizableInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withMargin").withMarginInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withPosition").withPositionInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withDimensions").WithDimensionsInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withHighlight").WithHighlightInterface> & typeof NightingaleElement;
declare class NightingaleSequence extends NightingaleSequence_base {
    #private;
    sequence?: string | null;
    protected seq_g?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    protected highlighted?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    margins?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    numberOfTicks?: number;
    chWidth?: number;
    chHeight?: number;
    getSingleBaseWidth(): number;
    connectedCallback(): void;
    get data(): string | Record<string, unknown>;
    set data(data: string | Record<string, unknown>);
    protected getCharSize(): void;
    protected createSequence(): void;
    firstUpdated(): void;
    zoomRefreshed(): void;
    renderD3(): void;
    protected getStart(): number;
    protected getEnd(): number;
    protected updateHighlight(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export default NightingaleSequence;
//# sourceMappingURL=nightingale-sequence.d.ts.map