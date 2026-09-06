import * as THREE from 'three'
import type { Vec3 } from '../types/attraction'
import { ROAD_PATH } from '../content/road'

/** PRD v2 §7.1 — straight LineCurve3 segments, not a smooth spline: matches
 * the blocky Kenney road-tile aesthetic (the car turns at corners the way the
 * tiles do). CurvePath.getPointAt(t)/.getTangentAt(t) are arc-length-correct
 * across the whole chain automatically — each child curve is weighted by its
 * own getLength(), so a global t∈[0,1] maps to uniform distance traveled
 * regardless of individual segment lengths. No manual distance table needed. */
export function buildRoadCurve(waypoints: Vec3[]): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>()
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = new THREE.Vector3(...waypoints[i])
    const b = new THREE.Vector3(...waypoints[i + 1])
    path.add(new THREE.LineCurve3(a, b))
  }
  return path
}

export const ROAD_CURVE = buildRoadCurve(ROAD_PATH)

/** PRD v2 §7.2 — an attraction's default curb point: the nearest point ON the
 * road to its `position`, expressed as a 0..1 progress value along the whole
 * route. Cheap exhaustive scan — a handful of buildings against a few dozen
 * line segments, nowhere near needing anything smarter at this scale. */
export function nearestTOnRoad(position: Vec3, samples = 400): number {
  const target = new THREE.Vector3(...position)
  let bestT = 0
  let bestDistSq = Infinity
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const p = ROAD_CURVE.getPointAt(t)
    const distSq = p.distanceToSquared(target)
    if (distSq < bestDistSq) {
      bestDistSq = distSq
      bestT = t
    }
  }
  return bestT
}
