import type { Camera } from "molstar/lib/mol-canvas3d/camera";
import type { Sphere3D } from "molstar/lib/mol-math/geometry";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";

/** Zoom changes viewing distance, not the scene's depth-clipping bounds. */
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

/** Reveal the full protein again when backing away from a focused region. */
export const getZoomOutClippingSnapshot = (
  snapshot: Camera.Snapshot,
  scene: Readonly<Sphere3D>,
  previousDistance: number,
): Pick<Camera.Snapshot, "radius" | "radiusMax" | "clipFar"> | undefined => {
  if (!Number.isFinite(scene.radius) || scene.radius <= 0) return undefined;

  const distance = Vec3.distance(snapshot.position, snapshot.target);
  if (!Number.isFinite(distance) || !Number.isFinite(previousDistance)
    || distance <= previousDistance + Math.max(0.0001, previousDistance * 0.000001)) return undefined;

  // The focus target can be off-center; include the protein's full depth around it.
  const offset = Vec3.distance(scene.center, snapshot.target);
  if (!Number.isFinite(offset)) return undefined;
  const radius = Math.max(snapshot.radius, scene.radius + offset + 1);
  if (snapshot.radius >= radius && snapshot.radiusMax >= radius && snapshot.clipFar) return undefined;
  return {
    radius,
    radiusMax: Math.max(snapshot.radiusMax, radius),
    clipFar: true,
  };
};
