import type CameraControlsImpl from 'camera-controls'
import type { CameraShot, Vec3 } from '../types/attraction'
import { DEFAULT_FOOTPRINT } from '../config'

/** PRD §7.3 — don't hand-place every building's camera by trial and error.
 * Computes a sensible 3/4-elevated establishing shot from a world position
 * and footprint; an Attraction's own `cameraShot` (§8) overrides this for
 * flagship stops that deserve hand art direction. */
export function computeDefaultShot(position: Vec3, footprint = DEFAULT_FOOTPRINT): CameraShot {
  const [x, , z] = position
  const distance = footprint * 2.2
  return {
    cameraPosition: [x + distance * 0.6, distance * 0.55, z + distance * 0.8],
    cameraTarget: [x, footprint * 0.35, z],
  }
}

/** PRD §7.3 — the only place that calls setLookAt. Every camera move in the
 * app (click a building, "back to city", guided tour) goes through here.
 * `enableTransition=false` when the visitor has prefers-reduced-motion set —
 * instant cut instead of a tween. */
export function flyTo(controls: CameraControlsImpl, shot: CameraShot, enableTransition = true) {
  const [px, py, pz] = shot.cameraPosition
  const [tx, ty, tz] = shot.cameraTarget
  return controls.setLookAt(px, py, pz, tx, ty, tz, enableTransition)
}
