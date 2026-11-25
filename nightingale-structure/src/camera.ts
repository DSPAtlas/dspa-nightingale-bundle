import type { Camera } from "molstar/lib/mol-canvas3d/camera";
import type { Sphere3D } from "molstar/lib/mol-math/geometry";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";

/**
 * Move the camera along its current viewing direction, keeping the focus target.
 * A factor below 1 zooms in; above 1 zooms out. Leave clipping bounds unchanged
 * here so zooming does not also shrink the depth of the protein being drawn.
 */
export const getZoomSnapshot = (
  snapshot: Camera.Snapshot,
  factor: number,
): Pick<Camera.Snapshot, "position"> | undefined => {
  if (!Number.isFinite(factor) || factor <= 0) return undefined;

  const direction = Vec3.sub(Vec3(), snapshot.position, snapshot.target);
  const currentDistance = Vec3.magnitude(direction);
  if (!Number.isFinite(currentDistance) || currentDistance === 0) return undefined;

  const nextDistance = Math.max(currentDistance * factor, 1);
  const nextDirection = Vec3.setMagnitude(direction, direction, nextDistance);
  return { position: Vec3.add(Vec3(), snapshot.target, nextDirection) };
};

/**
 * Restore full protein depth after zooming out from a barcode close-up.
 * Hover focus can intentionally narrow the clipping range to the selected region.
 * structure-viewer.ts calls this after a rendered frame, once any camera animation
 * has finished, passing the camera-to-target distance from the previous settled frame.
 * Only clipping settings are returned; camera position and focus stay unchanged.
 */
export const getZoomOutClippingSnapshot = (
  snapshot: Camera.Snapshot,
  scene: Readonly<Sphere3D>,
  previousDistance: number,
): Pick<Camera.Snapshot, "radius" | "radiusMax" | "clipFar"> | undefined => {
  if (!Number.isFinite(scene.radius) || scene.radius <= 0) return undefined;

  const distance = Vec3.distance(snapshot.position, snapshot.target);
  // Recover on outward movement only. The small absolute/relative tolerance
  // prevents floating-point jitter during rotation from triggering recovery.
  if (!Number.isFinite(distance) || !Number.isFinite(previousDistance)
    || distance <= previousDistance + Math.max(0.0001, previousDistance * 0.000001)) return undefined;

  // Clipping is centered on the focus target, which may be near the protein's edge.
  // Adding its offset from the scene center encloses the whole protein at any
  // orientation; the extra 1 Å is padding. Never reduce an already wider range.
  const offset = Vec3.distance(scene.center, snapshot.target);
  if (!Number.isFinite(offset)) return undefined;
  const radius = Math.max(snapshot.radius, scene.radius + offset + 1);
  // Avoid redundant camera updates once the depth range already covers the scene.
  if (snapshot.radius >= radius && snapshot.radiusMax >= radius && snapshot.clipFar) return undefined;
  return {
    radius,
    // Mol* clamps radius to radiusMax, so both must allow the recovered range.
    radiusMax: Math.max(snapshot.radiusMax, radius),
    // Use the recovered radius for the far clipping plane as well as the near one.
    clipFar: true,
  };
};

/** Track zoom separately from Mol* focus/reset commands, including same-region refocus. */
export const createZoomOutClippingTracker = (camera: Camera) => {
  let previousDistance = NaN;
  camera.stateChanged.subscribe((state) => {
    // Focus/reset commands carry a target or radius; zoom buttons only set position,
    // and wheel/gesture zoom mutates position directly. Rebase after focus settles.
    if (state.target !== undefined || state.radius !== undefined) previousDistance = NaN;
  });

  return (scene: Readonly<Sphere3D>) => {
    if (camera.transition.inTransition) return undefined;
    const snapshot = camera.getSnapshot();
    const clipping = getZoomOutClippingSnapshot(snapshot, scene, previousDistance);
    previousDistance = Vec3.distance(snapshot.position, snapshot.target);
    return clipping;
  };
};
