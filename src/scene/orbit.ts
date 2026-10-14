import { sceneConfig } from './config';

const turn = Math.PI * 2;
export const orbitOffset = (index: number, count: number) =>
  (index / count) * turn;

// A damped angular spring preserves velocity when focus changes midway through a turn.
export function createOrbit(count: number) {
  let angle = 0.42;
  let velocity = 0;
  let target: number | undefined;
  let active: number | undefined;
  return {
    get angle() {
      return angle;
    },
    get velocity() {
      return velocity;
    },
    get settled() {
      return target !== undefined && angle === target;
    },
    focus(index: number | undefined) {
      if (index === active) return;
      active = index;
      if (index === undefined) target = undefined;
      else {
        const error = Math.atan2(
          Math.sin(-orbitOffset(index, count) - angle),
          Math.cos(-orbitOffset(index, count) - angle),
        );
        target = angle + error;
      }
    },
    update(seconds: number, enabled: boolean) {
      if (!enabled) {
        velocity = 0;
        return false;
      }
      const steps = Math.max(1, Math.ceil(seconds * 120));
      const dt = seconds / steps;
      for (let i = 0; i < steps; i++) {
        if (target === undefined) {
          const speed = turn / sceneConfig.orbit.revolutionSeconds;
          velocity += (speed - velocity) * (1 - Math.exp(-dt * 2));
        } else {
          velocity += ((target - angle) * 7 - velocity * 5.5) * dt;
          velocity = Math.max(
            -sceneConfig.orbit.maxFocusSpeed,
            Math.min(sceneConfig.orbit.maxFocusSpeed, velocity),
          );
        }
        angle += velocity * dt;
        if (
          target !== undefined &&
          Math.abs(target - angle) < 0.0005 &&
          Math.abs(velocity) < 0.001
        ) {
          angle = target;
          velocity = 0;
        }
      }
      return target === undefined || angle !== target;
    },
  };
}
