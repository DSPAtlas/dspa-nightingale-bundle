import DefaultLayout, { LayoutOptions } from "./DefaultLayout";
import { Feature } from "./nightingale-track";
export default class NonOverlappingLayout extends DefaultLayout {
    /** Height of a row, including gap between rows */
    protected rowHeight: number;
    /** Height of a feature, excluding gap between rows */
    protected featureHeight: number;
    /** Y coordinate of the top of the first row */
    protected topOffset: number;
    /** Mapping of feature to row index */
    featuresMap: Map<Feature, number>;
    constructor(options: LayoutOptions);
    init(features: Feature[]): void;
    getFeatureYPos(feature: Feature): number;
    getFeatureHeight(): number;
}
//# sourceMappingURL=NonOverlappingLayout.d.ts.map