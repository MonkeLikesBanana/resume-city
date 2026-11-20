import type { FillerBuilding } from '../types/attraction'
import { generateBlock, clearsWedge } from '../lib/blocks'

// Use looser lot spacing than near Main Street to give each house a yard.
const HOUSE_MODELS = [
  '/assets/models/suburb/building-type-b.glb', '/assets/models/suburb/building-type-d.glb',
  '/assets/models/suburb/building-type-e.glb', '/assets/models/suburb/building-type-f.glb',
  '/assets/models/suburb/building-type-g.glb', '/assets/models/suburb/building-type-h.glb',
  '/assets/models/suburb/building-type-i.glb', '/assets/models/suburb/building-type-j.glb',
  '/assets/models/suburb/building-type-k.glb', '/assets/models/suburb/building-type-l.glb',
  '/assets/models/suburb/building-type-m.glb', '/assets/models/suburb/building-type-n.glb',
]

const ALONG: [number, number] = [6, 85]

// Keep generated lots clear of the park and basketball court footprints.
const EXCLUSION_ZONES: Array<{ x: [number, number]; z: [number, number] }> = [
  { x: [22, 44], z: [33, 57] }, // Park, with margin
  { x: [-44, -22], z: [54.5, 75.5] }, // BasketballCourt, with margin
]
function clearsLandmarks(position: [number, number, number]): boolean {
  const [x, , z] = position
  return !EXCLUSION_ZONES.some((zone) => x >= zone.x[0] && x <= zone.x[1] && z >= zone.z[0] && z <= zone.z[1])
}

// Keep the outer rows inside the grass patch and filter every row against the landmark and river clearances.
const ROW_OFFSETS = [13, 19, 25, 31, 37, 43]
const ROW_SPACING = [7, 7.5, 8.5, 9, 9.5, 10.5]
export const SUBURB_HOUSES: FillerBuilding[] = ROW_OFFSETS.flatMap((offset, i) =>
  generateBlock({
    along: ALONG,
    streetAxis: 'z',
    rowOffsets: [offset, -offset],
    lotSpacing: ROW_SPACING[i],
    models: HOUSE_MODELS,
    seed: 20260930 + i,
    jitter: 1.3 + i * 0.15,
  }),
)
  .filter((b) => clearsLandmarks(b.position))
  .filter((b) => clearsWedge(b.position))
