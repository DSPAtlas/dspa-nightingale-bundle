import type { Camera } from "molstar/lib/mol-canvas3d/camera";
import type { Sphere3D } from "molstar/lib/mol-math/geometry";
/** Zoom changes viewing distance, not the scene's depth-clipping bounds. */
export declare const getZoomSnapshot: (snapshot: Camera.Snapshot, factor: number) => Pick<Camera.Snapshot, "position"> | undefined;
/** Reveal the full protein again when backing away from a focused region. */
export declare const getZoomOutClippingSnapshot: (snapshot: Camera.Snapshot, scene: Readonly<Sphere3D>, previousDistance: number) => Pick<Camera.Snapshot, "radius" | "radiusMax" | "clipFar"> | undefined;
//# sourceMappingURL=camera.d.ts.map