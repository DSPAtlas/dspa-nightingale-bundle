import { Camera } from "molstar/lib/mol-canvas3d/camera";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { getZoomOutClippingSnapshot, getZoomSnapshot } from "../camera";

describe("structure zoom clipping", () => {
  it("preserves the full scene depth while zooming and rotating", () => {
    const radius = 72.443;
    const camera = new Camera({
      ...Camera.createDefaultSnapshot(),
      position: Vec3.create(0, 0, 300),
      target: Vec3.create(0, 0, 0),
      radius,
      radiusMax: radius,
    });
    const points = [
      [radius, 0, 0], [-radius, 0, 0],
      [0, radius, 0], [0, -radius, 0],
      [0, 0, radius], [0, 0, -radius],
    ];

    for (const factor of [0.8, 0.8, 0.8, 1.25, 1.25, 1.25]) {
      camera.setState(getZoomSnapshot(camera.getSnapshot(), factor), 0);
      const distance = Vec3.distance(camera.position, camera.target);

      for (const direction of [[0, 0, 1], [1, 0, 0], [0, 1, 1], [-1, -1, 1]]) {
        const eye = Vec3.normalize(Vec3(), direction);
        camera.setState({ position: Vec3.scale(Vec3(), eye, distance) }, 0);
        camera.update();

        expect(camera.state.radius).toBe(radius);
        expect(camera.state.radiusMax).toBe(radius);
        expect(camera.far - camera.near).toBeCloseTo(radius * 2, 8);
        for (const point of points) {
          const depth = distance - Vec3.dot(point, eye);
          expect(depth).toBeGreaterThanOrEqual(camera.near - 1e-8);
          expect(depth).toBeLessThanOrEqual(camera.far + 1e-8);
        }
      }
    }

    expect(Vec3.distance(camera.position, camera.target)).toBeCloseTo(300, 8);
    expect(camera.target).toEqual(Vec3.create(0, 0, 0));
  });

  it("ignores invalid zooms and retains the current zoom target", () => {
    const snapshot = {
      ...Camera.createDefaultSnapshot(),
      position: Vec3.create(10, 20, 110),
      target: Vec3.create(10, 20, 10),
    };
    expect(getZoomSnapshot(snapshot, 0.8)).toEqual({ position: Vec3.create(10, 20, 90) });
    for (const factor of [0, -1, NaN, Infinity]) {
      expect(getZoomSnapshot(snapshot, factor)).toBeUndefined();
    }
    expect(getZoomSnapshot({ ...snapshot, position: snapshot.target }, 0.8)).toBeUndefined();
  });

  it("retains original close-up focus and only recovers clipping when zooming out", () => {
    const scene = { center: Vec3.create(10, 20, 30), radius: 72.443 };
    const camera = new Camera({
      ...Camera.createDefaultSnapshot(),
      target: Vec3.clone(scene.center),
      position: Vec3.create(10, 20, 330),
      radius: scene.radius,
      radiusMax: scene.radius,
    });
    const target = Vec3.create(50, 20, 30);
    camera.setState(camera.getFocus(target, 5), 0);
    const focusedDistance = Vec3.distance(camera.position, camera.target);
    expect(focusedDistance).toBeCloseTo(camera.getTargetDistance(5), 8);
    expect(camera.state.radius).toBe(5);
    expect(getZoomOutClippingSnapshot(camera.getSnapshot(), scene, 300)).toBeUndefined();
    expect(getZoomOutClippingSnapshot(camera.getSnapshot(), scene, focusedDistance)).toBeUndefined();

    camera.setState(getZoomSnapshot(camera.getSnapshot(), 0.8), 0);
    expect(getZoomOutClippingSnapshot(camera.getSnapshot(), scene, focusedDistance)).toBeUndefined();
    const previousDistance = Vec3.distance(camera.position, camera.target);
    camera.setState(getZoomSnapshot(camera.getSnapshot(), 1.25), 0);
    const position = Vec3.clone(camera.position);
    camera.setState(getZoomOutClippingSnapshot(camera.getSnapshot(), scene, previousDistance), 0);
    expect(camera.position).toEqual(position);
    expect(camera.target).toEqual(target);
    expect(camera.state.radius).toBeGreaterThanOrEqual(scene.radius + 40);
  });

  it("keeps the whole protein within depth bounds after off-center hover, rotation and zoom out", () => {
    const radius = 72.443;
    const scene = { center: Vec3.create(10, 20, 30), radius };
    const camera = new Camera({
      ...Camera.createDefaultSnapshot(),
      target: Vec3.clone(scene.center),
      position: Vec3.create(10, 20, 330),
      radius,
      radiusMax: radius,
      clipFar: false,
    });
    const points = [
      [radius, 0, 0], [-radius, 0, 0], [0, radius, 0],
      [0, -radius, 0], [0, 0, radius], [0, 0, -radius],
    ].map(point => Vec3.add(Vec3(), scene.center, point));
    const targets = [
      Vec3.create(10 + radius, 20, 30),
      Vec3.create(10, 20 - radius, 30),
      Vec3.clone(scene.center),
    ];

    for (const target of targets) {
      camera.setState(camera.getFocus(target, 5), 0);
      const previousDistance = Vec3.distance(camera.position, camera.target);
      // Mouse-wheel zoom mutates position directly, without a camera state event.
      const distance = (scene.radius + Vec3.distance(scene.center, target)) * 3;
      Vec3.set(camera.position, target[0], target[1], target[2] + distance);
      camera.setState(getZoomOutClippingSnapshot(camera.getSnapshot(), scene, previousDistance), 0);
      expect(camera.state.clipFar).toBe(true);
      // Scene commits, such as changing color mode, must preserve the recovered range.
      const sceneRadiusFactor = camera.state.radiusMax / scene.radius;
      const recoveredRadius = camera.state.radius;
      camera.setState({ radiusMax: scene.radius * sceneRadiusFactor }, 0);
      expect(camera.state.radius).toBeCloseTo(recoveredRadius, 8);
      for (const direction of [[0, 0, 1], [1, 0, 0], [0, 1, 1], [-1, -1, 1]]) {
        const eye = Vec3.normalize(Vec3(), direction);
        camera.setState({ position: Vec3.scaleAndAdd(Vec3(), camera.target, eye, distance) }, 0);
        camera.update();
        for (const point of points) {
          const depth = distance - Vec3.dot(Vec3.sub(Vec3(), point, camera.target), eye);
          expect(depth).toBeGreaterThanOrEqual(camera.near - 1e-8);
          expect(depth).toBeLessThanOrEqual(camera.far + 1e-8);
        }
      }
      expect(getZoomOutClippingSnapshot(camera.getSnapshot(), scene, previousDistance)).toBeUndefined();
    }
  });
});
