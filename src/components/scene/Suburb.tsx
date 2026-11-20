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

/** Instance vegetation around the houses so each lot can have landscaping without extra draw calls per plant. */
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
