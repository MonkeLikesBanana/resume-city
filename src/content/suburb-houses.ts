import type { FillerBuilding } from '../types/attraction'
import { generateBlock, clearsWedge } from '../lib/blocks'

// PRD v3 §4.4/§8/§16c — ~26 additional houses lining the Lakeside street,
// deliberately sparser than the Foundry downtown blocks (larger lotSpacing,
// fewer rows) — that lower density is what makes it read as a suburb rather
// than "downtown with houses" (§2). Reuses the twelve unused Suburban-pack
// house variants exported alongside the five real Lakeside attractions.
const HOUSE_MODELS = [
  '/assets/models/suburb/building-type-b.glb', '/assets/models/suburb/building-type-d.glb',
  '/assets/models/suburb/building-type-e.glb', '/assets/models/suburb/building-type-f.glb',
  '/assets/models/suburb/building-type-g.glb', '/assets/models/suburb/building-type-h.glb',
  '/assets/models/suburb/building-type-i.glb', '/assets/models/suburb/building-type-j.glb',
  '/assets/models/suburb/building-type-k.glb', '/assets/models/suburb/building-type-l.glb',
  '/assets/models/suburb/building-type-m.glb', '/assets/models/suburb/building-type-n.glb',
]

const ALONG: [number, number] = [6, 85]

// PRD v3/v4 — Park.tsx (center [32,45], footprint roughly x:[24,42] z:[35,55])
// and BasketballCourt.tsx (center [-32,65], a 16x9 court, footprint roughly
// x:[-40,-24] z:[56.5,73.5]) both sit at exactly the depth (|x|~32) the new
// rows below reach. The two original rows (±16, ±23) never reached that far
// out, so this collision risk didn't exist before round 5 — checked by
// comparing the new rows' actual lot coordinates against each landmark's
// footprint, not assumed clear.
const EXCLUSION_ZONES: Array<{ x: [number, number]; z: [number, number] }> = [
  { x: [22, 44], z: [33, 57] }, // Park, with margin
  { x: [-44, -22], z: [54.5, 75.5] }, // BasketballCourt, with margin
]
function clearsLandmarks(position: [number, number, number]): boolean {
  const [x, , z] = position
  return !EXCLUSION_ZONES.some((zone) => x >= zone.x[0] && x <= zone.x[1] && z >= zone.z[0] && z <= zone.z[1])
}

// PRD v4 polish round 5 §3 — two more rows beyond the original outer row
// (±23), same reasoning as foundry-blocks.ts: same generator, same per-row
// density, just pushing the suburb's footprint further out (to ~±37) so it
// reads as a real neighborhood extending toward the mountains rather than
// two thin rows of houses with open ground behind them. Forest.tsx's
// regions were pushed outward to match.
//
// PRD v5.0 §4.6 — every row (not just the round-5 additions) filtered
// through clearsWedge() too: the -X (west) side of ANY row can land in the
// same map quadrant foundry-blocks.ts's +Z (north) rows independently
// claim near the junction — see blocks.ts's WEDGE_EXCLUSION_ZONE comment.
// The original ±16/±23 rows technically had this risk already (their -X
// side sits well inside the wedge zone's X range), it just wasn't visible
// until foundry-blocks.ts's own footprint grew far enough to actually
// reach the same territory.
export const SUBURB_HOUSES: FillerBuilding[] = [
  ...generateBlock({ along: ALONG, streetAxis: 'z', rowOffsets: [16, -16], lotSpacing: 12, models: HOUSE_MODELS, seed: 20260917, jitter: 1.5 }),
  ...generateBlock({ along: ALONG, streetAxis: 'z', rowOffsets: [23, -23], lotSpacing: 14, models: HOUSE_MODELS, seed: 20260918, jitter: 1.8 }),
  ...generateBlock({ along: ALONG, streetAxis: 'z', rowOffsets: [30, -30], lotSpacing: 14, models: HOUSE_MODELS, seed: 20260919, jitter: 1.8 }).filter((b) =>
    clearsLandmarks(b.position),
  ),
  ...generateBlock({ along: ALONG, streetAxis: 'z', rowOffsets: [37, -37], lotSpacing: 16, models: HOUSE_MODELS, seed: 20260920, jitter: 2 }).filter((b) =>
    clearsLandmarks(b.position),
  ),
].filter((b) => clearsWedge(b.position))
