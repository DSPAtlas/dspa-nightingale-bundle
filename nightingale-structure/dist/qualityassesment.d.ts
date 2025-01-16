/**
 * Copyright (c) 2021-24 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifFrame } from 'molstar/lib/mol-io/reader/cif';
import { CustomModelProperty } from 'molstar/lib/mol-model-props/common/custom-model-property';
import { CustomProperty } from 'molstar/lib/mol-model-props/common/custom-property';
import { Model, ResidueIndex } from 'molstar/lib/mol-model/structure/model';
import { QuerySymbolRuntime } from 'molstar/lib/mol-script/runtime/query/compiler';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
export { QualityAssessment };
interface QualityAssessment {
    localMetrics: Map<string, Map<ResidueIndex, number>>;
    pLDDT?: Map<ResidueIndex, number>;
    lipScore?: Map<ResidueIndex, number>;
    qmean?: Map<ResidueIndex, number>;
}
declare namespace QualityAssessment {
    interface Pairwise {
        id: number;
        name: string;
        residueRange: [ResidueIndex, ResidueIndex];
        valueRange: [number, number];
        values: Record<ResidueIndex, Record<ResidueIndex, number | undefined> | undefined>;
    }
    function isApplicable(model?: Model, localMetricName?: 'lipScore' | 'pLDDT' | 'qmean'): boolean;
    function obtain(ctx: CustomProperty.Context, model: Model, props: QualityAssessmentProps): Promise<CustomProperty.Data<QualityAssessment>>;
    function findModelArchiveCIFPAEMetrics(frame: CifFrame): {
        id: number;
        name: string;
    }[];
    function pairwiseMetricFromModelArchiveCIF(model: Model, frame: CifFrame, metricId: number): Pairwise | undefined;
    const symbols: {
        pLDDT: QuerySymbolRuntime;
        lipScore: QuerySymbolRuntime;
        qmean: QuerySymbolRuntime;
    };
}
export declare const QualityAssessmentParams: {};
export type QualityAssessmentParams = typeof QualityAssessmentParams;
export type QualityAssessmentProps = PD.Values<QualityAssessmentParams>;
export declare const QualityAssessmentProvider: CustomModelProperty.Provider<QualityAssessmentParams, QualityAssessment>;
//# sourceMappingURL=qualityassesment.d.ts.map