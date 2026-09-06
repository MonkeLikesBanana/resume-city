import * as THREE from 'three'
import type CameraControlsImpl from 'camera-controls'
import { ROAD_CURVE } from './road'
import { CAR_EYE_HEIGHT, ARRIVAL_TILT_FRACTION, DRIVE_SPEED } from '../config'
import type { Attraction } from '../types/attraction'

const ROAD_LENGTH = ROAD_CURVE.getLength()

export function driveDuration(fromT: number, toT: number): number {
  const distance = Math.abs(toT - fromT) * ROAD_LENGTH
  return Math.max(0.35, distance / DRIVE_SPEED)
}

/** PRD v2 §7.3 phase 1 — DRIVE. Writes camera.position/lookAt directly, every
 * frame, for the duration of the drive. Deliberately bypasses CameraControls:
 * driving its setLookAt() every frame fights its internal damped-velocity
 * state (built for occasional discrete calls, not being called every frame)
 * and can leave stale velocity that jerks visibly once phase 2's real
 * transition starts. CameraControls sits inert while this runs.
 *
 * Returns the look-at point actually used, so the caller can hand it to
 * phase 2's sync call. */
export function stepDrive(camera: THREE.Camera, t: number, direction: 1 | -1): THREE.Vector3 {
  const p = ROAD_CURVE.getPointAt(t)
  camera.position.set(p.x, p.y + CAR_EYE_HEIGHT, p.z)

  const lookAheadT = clamp(t + 0.02 * direction, 0, 1)
  const ahead = ROAD_CURVE.getPointAt(lookAheadT)
  const lookTarget = new THREE.Vector3(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z)
  camera.lookAt(lookTarget)
  return lookTarget
}

/** PRD v2 §7.3 phase 2 — ARRIVE. Hands off to CameraControls for a damped
 * "look up" pan. Two calls, in order:
 *   1. SYNC (no transition) — seeds CameraControls' internal state to match
 *      wherever phase 1 actually left the camera. Skipping this is the #1
 *      way to get a visible jerk: CameraControls would otherwise animate
 *      FROM whatever pose it last remembered (e.g. the previous stop),
 *      ignoring where phase 1 really parked the car.
 *   2. TILT (transitioned, unless reducedMotion) — moves ONLY the look
 *      target's height, camera position unchanged. Taller buildings tilt
 *      further, from the same formula every time — no per-building camera
 *      overrides (v1's DECA special-case is gone).
 */
export function arriveAndTilt(
  controls: CameraControlsImpl,
  camera: THREE.Camera,
  currentLookTarget: THREE.Vector3,
  attraction: Attraction,
  reducedMotion: boolean,
) {
  const { x: px, y: py, z: pz } = camera.position

  // 1. Sync — no transition.
  controls.setLookAt(px, py, pz, currentLookTarget.x, currentLookTarget.y, currentLookTarget.z, false)

  // 2. Tilt — the visible "pan up once you arrive."
  const [ax, ay, az] = attraction.position
  const tiltTargetY = ay + attraction.height * ARRIVAL_TILT_FRACTION

  // A building whose position sits essentially ON the road (e.g. the Welcome
  // Plaza's gate, which spans the road itself rather than sitting off to one
  // side) has almost no horizontal offset from the camera's curb point —
  // looking straight at its X/Z degenerates into looking straight up. Fall
  // back to the forward-along-the-road direction the drive already
  // established, just raised to the tilt height, instead.
  const horizontalOffsetSq = (ax - px) ** 2 + (az - pz) ** 2
  const [tx, tz] = horizontalOffsetSq > 1 ? [ax, az] : [currentLookTarget.x, currentLookTarget.z]

  controls.setLookAt(px, py, pz, tx, tiltTargetY, tz, !reducedMotion)
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
