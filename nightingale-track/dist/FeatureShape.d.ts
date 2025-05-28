export type Shapes = "rectangle" | "roundRectangle" | "bridge" | "line" | "bridge" | "diamond" | "chevron" | "catFace" | "triangle" | "wave" | "hexagon" | "pentagon" | "circle" | "arrow" | "doubleBar" | "discontinuosStart" | "discontinuos" | "discontinuosEnd" | "helix" | "strand";
export default class FeatureShape {
    #private;
    private shape2function;
    getFeatureShape(aaWidth: number, ftHeight: number, ftLength: number, shape: Shapes): string;
    static isContinuous(shape: Shapes): boolean;
    private rectangle;
    private roundRectangle;
    line(): string;
    bridge(): string;
    diamond(): string;
    chevron(): string;
    catFace(): string;
    triangle(): string;
    wave(): string;
    private getPolygon;
    hexagon(): string;
    pentagon(): string;
    circle(): string;
    arrow(): string;
    doubleBar(): string;
    discontinuosStart(): string;
    discontinuos(): string;
    discontinuosEnd(): string;
    helix(): string;
    strand(): string;
}
//# sourceMappingURL=FeatureShape.d.ts.map