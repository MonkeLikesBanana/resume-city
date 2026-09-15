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

// PRD v7.0 round 2 — the parked camera's horizontal standoff from every
// attraction is fixed (curbFor() just finds the nearest point on the road,
// independent of the building's own height — §7.2's "park at the curb"
// model has no notion of backing further away for a taller building). That
// ~9m standoff is roughly right for house/storefront-scale buildings
// (2-4m), but Robotics Workshop (11m) and DECA Business Center (13.4m —
// both real kitbashed towers, not a data-entry mistake) are tall enough
// that 9m away puts the camera close enough that most of the frame is
// flat, undifferentiated wall regardless of look angle — confirmed by
// screenshotting both and finding neither building's silhouette actually
// fits in frame, unlike every other attraction (next-tallest is 3.9m,
// which frames cleanly at the same 9m standoff).
//
// Fixed with `standoffBoost`: backs the parked camera position further
// from the building — along the existing curb point's own direction from
// the building, so it stays a plausible "parked a bit further down/across
// the street" position, not an arbitrary floating camera — enough to
// actually fit a tall building's silhouette in frame. Left at 0 for every
// attraction under the threshold, so the 10 normally-scaled attractions
// are byte-for-byte unaffected. Blended in via the same `arrivalBlend`
// driveFrame() already uses for the tilt, so there's no position pop on
// arrival — it eases in exactly like the existing tilt does.
//
// A first attempt also capped the *height* fed into `tiltTargetFor` below
// (reasoning: a shorter look-target height means a less extreme upward
// tilt angle) — reverted after screenshotting it: capping the tilt height
// while ALSO backing the camera up made the look target aim proportionally
// too low for the now-further-back camera, clipping the hotspot title
// marker (Hotspot.tsx renders it at `attraction.height + 1.5`, uncapped)
// off the top of the frame instead of fixing the crop. The real building
// height, uncapped, is the correct tilt target regardless of standoff
// distance — it's the same target a shorter building already used
// correctly; only the distance needed adjusting, not the angle.
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
  const [px, pz] = applyStandoff(curbPoint.x, curbPoint.z, destination, standoffBoost(destination.height))
  camera.position.set(px, curbPoint.y + CAR_EYE_HEIGHT, pz)
  tiltTargetFor(destination, _tiltTarget)
  _lookMatrix.lookAt(camera.position, _tiltTarget, _up)
  camera.quaternion.setFromRotationMatrix(_lookMatrix)
}
