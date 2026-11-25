import type { Camera } from "molstar/lib/mol-canvas3d/camera";
import type { Sphere3D } from "molstar/lib/mol-math/geometry";
/**
 * Move the camera along its current viewing direction, keeping the focus target.
 * A factor below 1 zooms in; above 1 zooms out. Leave clipping bounds unchanged
 * here so zooming does not also shrink the depth of the protein being drawn.
 */
export declare const getZoomSnapshot: (snapshot: Camera.Snapshot, factor: number) => Pick<Camera.Snapshot, "position"> | undefined;
/**
 * Restore full protein depth after zooming out from a barcode close-up.
 * Hover focus can intentionally narrow the clipping range to the selected region.
 * structure-viewer.ts calls this after a rendered frame, once any camera animation
 * has finished, passing the camera-to-target distance from the previous settled frame.
 * Only clipping settings are returned; camera position and focus stay unchanged.
 */
export declare const getZoomOutClippingSnapshot: (snapshot: Camera.Snapshot, scene: Readonly<Sphere3D>, previousDistance: number) => Pick<Camera.Snapshot, "radius" | "radiusMax" | "clipFar"> | undefined;
/** Track zoom separately from Mol* focus/reset commands, including same-region refocus. */
export declare const createZoomOutClippingTracker: (camera: Camera) => (scene: Readonly<Sphere3D>) => Pick<Camera.Snapshot, "radius" | "radiusMax" | "clipFar"> | undefined;
//# sourceMappingURL=camera.d.ts.map