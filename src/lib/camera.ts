import * as THREE from 'three'
import { CAR_EYE_HEIGHT, ARRIVAL_TILT_FRACTION, DRIVE_SPEED } from '../config'
import type { Attraction } from '../types/attraction'
import type { TripCurve } from './roadGraph'

const ARRIVAL_BLEND_FRACTION = 0.15 // last 15% of the trip blends the look toward the destination's tilt target
const LOOKAHEAD_DELTA = 0.02
const ROTATION_SMOOTHING_RATE = 10 // 1/seconds — exponential slerp damping constant

export function driveDuration(tripLength: number): number {
  return Math.max(0.35, tripLength / DRIVE_SPEED)
}

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

/** PRD v3 §7.3 — ONE continuous per-frame controller for the whole trip, no
 * hand-off between two systems. Position follows the trip's curve (already
 * smoothed through any junction corner, src/lib/roadGraph.ts); the look
 * target blends smoothly from "ahead along the road" to "the destination,
 * tilted up by its height" over the final stretch, instead of switching hard
 * once the car technically stops; and rotation is damped via quaternion
 * slerp instead of a hard lookAt snap every frame, which is what actually
 * fixes "jerky" on ordinary straight stretches (the corner-smoothing in
 * roadGraph.ts fixes the OTHER source of jerkiness, the junction turn
 * itself — the two are independent and both needed). */
export function driveFrame(
  camera: THREE.PerspectiveCamera,
  tripCurve: TripCurve,
  progress: number, // 0..1, already eased by the caller
  destination: Attraction,
  delta: number,
) {
  const p = tripCurve.getPointAt(progress)
  camera.position.set(p.x, p.y + CAR_EYE_HEIGHT, p.z)

  const aheadU = clamp(progress + LOOKAHEAD_DELTA, 0, 1)
  const ahead = tripCurve.getPointAt(aheadU)
  _aheadTarget.set(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z)

  tiltTargetFor(destination, _tiltTarget)
  const arrivalBlend = smoothstep(1 - ARRIVAL_BLEND_FRACTION, 1, progress)
  _lookTarget.copy(_aheadTarget).lerp(_tiltTarget, arrivalBlend)

  _lookMatrix.lookAt(camera.position, _lookTarget, _up)
  _desiredQuat.setFromRotationMatrix(_lookMatrix)

  const damping = 1 - Math.exp(-ROTATION_SMOOTHING_RATE * delta)
  camera.quaternion.slerp(_desiredQuat, damping)
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
