import { ColorTheme } from 'molstar/lib/mol-theme/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
export declare function getLIPColorThemeParams(ctx: ThemeDataContext): {};
export type LIPColorThemeParams = ReturnType<typeof getLIPColorThemeParams>;
export declare function LIPColorTheme(ctx: ThemeDataContext, props: PD.Values<LIPColorThemeParams>): ColorTheme<LIPColorThemeParams>;
export declare const LIPColorThemeProvider: ColorTheme.Provider<LIPColorThemeParams, 'lipScore'>;
//# sourceMappingURL=color.d.ts.map