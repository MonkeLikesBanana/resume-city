import * as THREE from 'three'
import type { Vec3, Arm, RoadPosition } from '../types/attraction'
import { ARMS } from '../content/road'

/** A minimal arc-length-parametrized curve: getPointAt(u) for u in [0,1] maps
 * linearly to distance traveled, same contract as THREE.Curve/CurvePath's own
 * getPointAt. Trip curves (below) are built by joining pieces of different
 * underlying types (straight arm segments + one Catmull-Rom junction blend),
 * which is simpler to compose as this small custom interface than to fight
 * THREE.Curve's subclassing contract for something used exactly once per
 * trip and thrown away. */
export interface TripCurve {
  getPointAt(u: number): THREE.Vector3
  getLength(): number
}

function buildArmCurve(waypoints: Vec3[]): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>()
  for (let i = 0; i < waypoints.length - 1; i++) {
    path.add(new THREE.LineCurve3(new THREE.Vector3(...waypoints[i]), new THREE.Vector3(...waypoints[i + 1])))
  }
  return path
}

export const ARM_CURVES: Record<Arm, THREE.CurvePath<THREE.Vector3>> = {
  foundry: buildArmCurve(ARMS.foundry),
  lakeside: buildArmCurve(ARMS.lakeside),
  plaza: buildArmCurve(ARMS.plaza),
}

const ARM_LENGTHS: Record<Arm, number> = {
  foundry: ARM_CURVES.foundry.getLength(),
  lakeside: ARM_CURVES.lakeside.getLength(),
  plaza: ARM_CURVES.plaza.getLength(),
}

/** PRD §7.2 — an attraction's default curb point: the nearest point on its
 * OWN district's arm to its `position`. Cheap exhaustive scan, same
 * scale/approach as v2. */
export function nearestPositionOnArm(arm: Arm, position: Vec3, samples = 400): RoadPosition {
  const target = new THREE.Vector3(...position)
  const curve = ARM_CURVES[arm]
  let bestT = 0
  let bestDistSq = Infinity
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const distSq = curve.getPointAt(t).distanceToSquared(target)
    if (distSq < bestDistSq) {
      bestDistSq = distSq
      bestT = t
    }
  }
  return { arm, t: bestT }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function makeSubCurve(arm: Arm, fromT: number, toT: number): TripCurve {
  const curve = ARM_CURVES[arm]
  const length = Math.abs(toT - fromT) * ARM_LENGTHS[arm]
  return {
    getLength: () => length,
    getPointAt: (u: number) => curve.getPointAt(clamp(fromT + (toT - fromT) * u, 0, 1)),
  }
}

function makeCornerCurve(points: THREE.Vector3[]): TripCurve {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
  const length = curve.getLength()
  return {
    getLength: () => length,
    getPointAt: (u: number) => curve.getPointAt(clamp(u, 0, 1)),
  }
}

function joinTripCurves(pieces: TripCurve[]): TripCurve {
  const valid = pieces.filter((p) => p.getLength() > 1e-6)
  const totalLength = valid.reduce((sum, p) => sum + p.getLength(), 0)
  if (valid.length === 0) {
    const zero = new THREE.Vector3()
    return { getLength: () => 0, getPointAt: () => zero }
  }
  return {
    getLength: () => totalLength,
    getPointAt(u: number) {
      let dist = clamp(u, 0, 1) * totalLength
      for (let i = 0; i < valid.length; i++) {
        const piece = valid[i]
        const len = piece.getLength()
        if (dist <= len || i === valid.length - 1) {
          return piece.getPointAt(clamp(dist / len, 0, 1))
        }
        dist -= len
      }
      return valid[valid.length - 1].getPointAt(1)
    },
  }
}

// PRD §7.1 — how far, in meters, on either side of the junction the corner
// gets rounded into a smooth arc instead of a sharp point. This is the fix
// for the "jerky at the Plaza corner" complaint: a geometrically sharp 90°
// vertex is jerky no matter how well rotation is damped on top of it (§7.3
// damps rotation too, for the OTHER source of jerkiness — general per-frame
// heading noise on straight stretches).
const JUNCTION_BLEND_RADIUS = 10

/** Builds the full drivable curve for one trip, from any curb point to any
 * other. Same-arm trips are a single straight sub-range. Cross-arm trips
 * (including any trip to/from the Plaza, since it's modeled as its own arm)
 * get a Catmull-Rom-smoothed corner spliced between two straight run/depart
 * legs — see PRD §7.1. */
export function buildTripCurve(from: RoadPosition, to: RoadPosition): TripCurve {
  if (from.arm === to.arm) return makeSubCurve(from.arm, from.t, to.t)

  const tA = clamp(JUNCTION_BLEND_RADIUS / ARM_LENGTHS[from.arm], 0, 1)
  const tB = clamp(JUNCTION_BLEND_RADIUS / ARM_LENGTHS[to.arm], 0, 1)
  // If the trip starts/ends already inside the blend zone, don't try to run
  // further out than the actual start/end point — clamp to whichever is closer.
  const approachT = Math.min(from.t, tA)
  const departT = Math.min(to.t, tB)

  const approachPoint = ARM_CURVES[from.arm].getPointAt(approachT)
  const junctionPoint = new THREE.Vector3(0, 0, 0)
  const departPoint = ARM_CURVES[to.arm].getPointAt(departT)

  return joinTripCurves([
    makeSubCurve(from.arm, from.t, approachT),
    makeCornerCurve([approachPoint, junctionPoint, departPoint]),
    makeSubCurve(to.arm, departT, to.t),
  ])
}
