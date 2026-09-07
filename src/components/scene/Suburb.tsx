import { useMemo } from 'react'
import type { FillerBuilding } from '../../types/attraction'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'
import InstancedBuildings from './InstancedBuildings'

const GREENERY_MODELS = ['/assets/models/tree-small.glb', '/assets/models/tree-large.glb']

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** PRD v4 §4.3 — a small tree/bush near every house, not just concentrated
 * at the Park (§4.4 in v3) — a real yard has *something* growing in it.
 *
 * PRD v4 polish round 5 — rendered via InstancedBuildings (2 unique models,
 * shared across however many yards exist), not a <Building> per item. That
 * per-item version was fine at the original house count, but round 5's
 * "fill out the map" expansion pushed mobile AND desktop Lighthouse Total
 * Blocking Time up substantially even though the houses themselves were
 * already properly instanced — this was the actual, unnoticed cost:
 * driveways() in RoadNetwork.tsx has the identical pattern and got the
 * same fix, for the same reason. More houses means more yards/driveways
 * 1:1, so anything scaling with house count needs to be instanced too, not
 * just the houses themselves. */
function yardGreeneryItems(): FillerBuilding[] {
  const rand = mulberry32(20260914)
  const houses = [
    ...SUBURB_HOUSES.map((h) => h.position),
    ...ATTRACTIONS.filter((a) => a.district === 'lakeside' && a.model).map((a) => a.position),
  ]
  return houses.map(([hx, , hz], i) => {
    const side = hx > 0 ? -1 : 1 // plant on the street-facing side, same convention as the house's own rotation
    return {
      model: GREENERY_MODELS[i % GREENERY_MODELS.length],
      position: [hx + side * (2.2 + rand() * 1.2), 0, hz + (rand() - 0.5) * 3] as [number, number, number],
      rotationY: rand() * Math.PI * 2,
      scale: 2.2 + rand() * 0.8,
    }
  })
}

export default function Suburb() {
  const yardGreenery = useMemo(yardGreeneryItems, [])
  return (
    <group>
      <InstancedBuildings buildings={SUBURB_HOUSES} />
      <InstancedBuildings buildings={yardGreenery} />
    </group>
  )
}
