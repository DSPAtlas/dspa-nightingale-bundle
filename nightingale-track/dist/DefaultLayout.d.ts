import { Feature } from "./nightingale-track";
export type LayoutOptions = {
    /** Height of the whole track */
    layoutHeight: number;
    /** Empty space at the top/bottom/left/right of the track */
    margin?: Margin;
    /** Minimum feature height (excluding gap) */
    minHeight?: number;
    /** Maximum feature height (excluding gap) */
    maxHeight?: number;
    /** Gap between two rows in non-overlapping layout.
     * Rectangle stroke protrudes into this gap, so the default value 2 means 1px of white space between rows.
     * When there are to many rows, gap will be reduced. */
    gap?: number;
};
type Margin = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export default class DefaultLayout {
    protected margin: Margin;
    protected minHeight: number;
    protected maxHeight: number;
    protected gap: number;
    protected layoutHeight: number;
    features: Feature[];
    constructor({ layoutHeight, margin, minHeight, // Using a non-zero value to keep SVG shapes targetable with cursor
    maxHeight, gap, }: LayoutOptions);
    init(features: Feature[], ..._args: unknown[]): void;
    getFeatureYPos(feature?: Feature | string): number;
    getFeatureHeight(..._args: unknown[]): number;
}
export {};
//# sourceMappingURL=DefaultLayout.d.ts.map