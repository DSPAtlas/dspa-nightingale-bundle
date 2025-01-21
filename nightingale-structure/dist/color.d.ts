import { ColorTheme } from 'molstar/lib/mol-theme/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
export declare function getLIPColorThemeParams(ctx: ThemeDataContext): {};
export type LIPColorThemeParams = ReturnType<typeof getLIPColorThemeParams>;
export declare const LIPColorThemeProvider: ColorTheme.Provider<LIPColorThemeParams, 'lipScore'>;
export declare function LIPColorTheme2(ctx: ThemeDataContext, props: PD.Values<LIPColorThemeParams>): ColorTheme<LIPColorThemeParams>;
//# sourceMappingURL=color.d.ts.map