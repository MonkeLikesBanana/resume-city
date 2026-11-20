import * as THREE from 'three'
import { CAR_EYE_HEIGHT, ARRIVAL_TILT_FRACTION } from '../config'
import type { Attraction } from '../types/attraction'
import type { TripCurve } from './roadGraph'

const ARRIVAL_BLEND_FRACTION = 0.15 // last 15% of a trip blends the look toward the destination's tilt target
const LOOKAHEAD_DELTA = 0.02
const ROTATION_SMOOTHING_RATE = 5 // 1/seconds — exponential slerp damping constant; lower = the camera takes longer to catch up to a new heading, i.e. slower-feeling turns

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

// Move the parked camera farther from tall buildings so their facades fit vertically.
const STANDOFF_HEIGHT_THRESHOLD = 4
const STANDOFF_PER_METER = 0.4
const MAX_STANDOFF_BOOST = 3.5

function tiltTargetFor(destination: Attraction, out: THREE.Vector3): THREE.Vector3 {
  const [dx, dy, dz] = destination.position
  return out.set(dx, dy + destination.height * ARRIVAL_TILT_FRACTION, dz)
}

function standoffBoost(height: number): number {
  return Math.min(MAX_STANDOFF_BOOST, Math.max(0, height - STANDOFF_HEIGHT_THRESHOLD) * STANDOFF_PER_METER)
}

/** Pushes (px, pz) further from destination.position along the direction
 * it's already offset in — i.e. "back away, don't reroute" — scaled by
 * `boost` (already 0 for anything under STANDOFF_HEIGHT_THRESHOLD, so this
 * is a no-op call for 10 of the 12 attractions). */
function applyStandoff(px: number, pz: number, destination: Attraction, boost: number): [number, number] {
  if (boost <= 0) return [px, pz]
  const dx = px - destination.position[0]
  const dz = pz - destination.position[2]
  const len = Math.hypot(dx, dz) || 1
  return [px + (dx / len) * boost, pz + (dz / len) * boost]
}

function applyLookAt(camera: THREE.PerspectiveCamera, target: THREE.Vector3, delta: number) {
  _lookMatrix.lookAt(camera.position, target, _up)
  _desiredQuat.setFromRotationMatrix(_lookMatrix)
  const damping = 1 - Math.exp(-ROTATION_SMOOTHING_RATE * delta)
  camera.quaternion.slerp(_desiredQuat, damping)
}

/** Follow the shared curve in either direction and blend toward the destination as the car arrives. */
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
  const arrivalBlend = smoothstep(1 - ARRIVAL_BLEND_FRACTION, 1, localProgress)
  const [px, pz] = applyStandoff(p.x, p.z, destination, standoffBoost(destination.height) * arrivalBlend)
  camera.position.set(px, p.y + CAR_EYE_HEIGHT, pz)

  const aheadU = clamp(curveU + LOOKAHEAD_DELTA * direction, 0, 1)
  const ahead = tripCurve.getPointAt(aheadU)
  _aheadTarget.set(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z)

  tiltTargetFor(destination, _tiltTarget)
  _lookTarget.copy(_aheadTarget).lerp(_tiltTarget, arrivalBlend)

  applyLookAt(camera, _lookTarget, delta)
}

/** Look along the road during scrubbing until the camera has a destination to frame. */
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
  const [px, pz] = applyStandoff(curbPoint.x, curbPoint.z, destination, standoffBoost(destination.height))
  camera.position.set(px, curbPoint.y + CAR_EYE_HEIGHT, pz)
  tiltTargetFor(destination, _tiltTarget)
  _lookMatrix.lookAt(camera.position, _tiltTarget, _up)
  camera.quaternion.setFromRotationMatrix(_lookMatrix)
}
