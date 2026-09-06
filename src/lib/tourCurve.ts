import { buildTripCurve, joinTripCurves, curbFor, type TripCurve } from './roadGraph'
import { TOUR_ORDER } from '../content/tour'

// PRD v4 §7.1 — the entire tour, built once as a single fixed path. Every
// navigation (Next/Prev, a direct AccessibleNav jump, or the explore-
// yourself scrub, §7.5) becomes movement along different points of this one
// curve instead of constructing a fresh per-trip curve each time. Chaining
// buildTripCurve() across every consecutive pair reuses its existing
// same-arm/cross-arm handling (including the Catmull-Rom junction blend,
// src/lib/roadGraph.ts) — the one leg that crosses districts (FLL Center →
// The Café) gets the same smooth corner as any other cross-arm trip, no
// special case needed here.
const legs: TripCurve[] = []
for (let i = 0; i < TOUR_ORDER.length - 1; i++) {
  legs.push(buildTripCurve(curbFor(TOUR_ORDER[i]), curbFor(TOUR_ORDER[i + 1])))
}

export const TOUR_CURVE: TripCurve = joinTripCurves(legs)

const totalLength = TOUR_CURVE.getLength()

/** Cumulative arc-length position (0..1) of every TOUR_ORDER stop along
 * TOUR_CURVE, in the same order — TOUR_STOP_U[i] is where TOUR_ORDER[i]
 * parks. Computed once from each leg's own length, not re-derived per nav. */
export const TOUR_STOP_U: number[] = (() => {
  const cumulative: number[] = [0]
  let sum = 0
  for (const leg of legs) {
    sum += leg.getLength()
    cumulative.push(sum / totalLength)
  }
  return cumulative
})()

export function tourIndexFor(id: string): number {
  return TOUR_ORDER.findIndex((a) => a.id === id)
}

export function nearestTourIndex(u: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < TOUR_STOP_U.length; i++) {
    const d = Math.abs(TOUR_STOP_U[i] - u)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}
