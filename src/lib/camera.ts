import * as THREE from 'three'
import { CAR_EYE_HEIGHT, ARRIVAL_TILT_FRACTION } from '../config'
import type { Attraction } from '../types/attraction'
import type { TripCurve } from './roadGraph'

const ARRIVAL_BLEND_FRACTION = 0.15 // last 15% of a trip blends the look toward the destination's tilt target
const LOOKAHEAD_DELTA = 0.02
const ROTATION_SMOOTHING_RATE = 10 // 1/seconds — exponential slerp damping constant

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

const _up = new THREE.Vector3(0, 1, 0)
const _lookMatrix = new THREE.Matrix4()
const _aheadTarget = new THREE.Vector3()
const _tiltTarget = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()
const _desiredQuat = new THREE.Quaternion()

function tiltTargetFor(destination: Attraction, out: THREE.Vector3): THREE.Vector3 {
  const [dx, dy, dz] = destination.position
  return out.set(dx, dy + destination.height * ARRIVAL_TILT_FRACTION, dz)
}

function applyLookAt(camera: THREE.PerspectiveCamera, target: THREE.Vector3, delta: number) {
  _lookMatrix.lookAt(camera.position, target, _up)
  _desiredQuat.setFromRotationMatrix(_lookMatrix)
  const damping = 1 - Math.exp(-ROTATION_SMOOTHING_RATE * delta)
  camera.quaternion.slerp(_desiredQuat, damping)
}

/** PRD v4 §7.1/§7.3 — driven along the ONE shared TOUR_CURVE now, not a
 * fresh per-trip curve — `curveU` is this frame's global position on that
 * curve, `direction` is which way `curveU` is currently moving (+1/-1,
 * needed for the look-ahead point now that "ahead" isn't always "toward
 * increasing u" — Prev moves curveU *down*), and `localProgress` is 0..1
 * within just this specific trip (for the arrival-tilt blend below — a
 * global curveU would almost never approach 1, since TOUR_CURVE spans the
 * whole city, not one trip). Position/look-ahead/rotation-damping mechanics
 * are otherwise unchanged from v3. */
export function driveFrame(
  camera: THREE.PerspectiveCamera,
  tripCurve: TripCurve,
  curveU: number,
  direction: 1 | -1,
  localProgress: number,
  destination: Attraction,
  delta: number,
) {
  const p = tripCurve.getPointAt(curveU)
  camera.position.set(p.x, p.y + CAR_EYE_HEIGHT, p.z)

  const aheadU = clamp(curveU + LOOKAHEAD_DELTA * direction, 0, 1)
  const ahead = tripCurve.getPointAt(aheadU)
  _aheadTarget.set(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z)

  tiltTargetFor(destination, _tiltTarget)
  const arrivalBlend = smoothstep(1 - ARRIVAL_BLEND_FRACTION, 1, localProgress)
  _lookTarget.copy(_aheadTarget).lerp(_tiltTarget, arrivalBlend)

  applyLookAt(camera, _lookTarget, delta)
}

/** PRD v4 §7.5 — explore-yourself scrub: position + look-ahead + damped
 * rotation, same as driveFrame, but never blends toward an arrival tilt —
 * there's no single destination while gliding freely, and tilting up at
 * every stop passed mid-scrub would be chaotic. Only used while a scrub key
 * is actively held or decelerating; releasing hands off to a normal
 * driveFrame()-driven "settle" trip (CameraRig). */
export function scrubFrame(camera: THREE.PerspectiveCamera, tripCurve: TripCurve, curveU: number, direction: 1 | -1, delta: number) {
  const p = tripCurve.getPointAt(curveU)
  camera.position.set(p.x, p.y + CAR_EYE_HEIGHT, p.z)

  const aheadU = clamp(curveU + LOOKAHEAD_DELTA * direction, 0, 1)
  const ahead = tripCurve.getPointAt(aheadU)
  _aheadTarget.set(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z)

  applyLookAt(camera, _aheadTarget, delta)
}

/** Instant placement — no animation at all. Used for the very first frame
 * ever rendered, prefers-reduced-motion, and to hard-correct the final frame
 * of every trip (eliminates any residual slerp error so the parked framing
 * is always pixel-exact, never "almost caught up"). */
export function snapTo(camera: THREE.PerspectiveCamera, curbPoint: THREE.Vector3, destination: Attraction) {
  camera.position.set(curbPoint.x, curbPoint.y + CAR_EYE_HEIGHT, curbPoint.z)
  tiltTargetFor(destination, _tiltTarget)
  _lookMatrix.lookAt(camera.position, _tiltTarget, _up)
  camera.quaternion.setFromRotationMatrix(_lookMatrix)
}
