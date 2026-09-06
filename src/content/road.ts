import type { Vec3 } from '../types/attraction'

// PRD v2 §7.1/§8 — the single continuous drivable route, in tour order.
// Straight segments (not a smooth spline) to match the blocky Kenney road-tile
// aesthetic — the car visibly turns at corners the way the tiles do.
//
// Layout: one straight Main Street along Z=0, Foundry District west of the
// Plaza (negative X), Lakeside District east (positive X). Buildings sit off
// the centerline (±9 in Z); their curb point is the nearest point ON this
// line, which — since the road itself never leaves Z=0 — is just the matching
// X coordinate. See src/content/attractions.ts for exact building positions.
export const ROAD_PATH: Vec3[] = [
  [-76, 0, 0], // Foundry gateway (west end)
  [-66, 0, 0], // fll-center curb
  [-58, 0, 0], // deca-center curb
  [-46, 0, 0], // makers-club curb
  [-36, 0, 0], // academic-hall curb
  [-26, 0, 0], // neemo-hq curb
  [-16, 0, 0], // robotics-workshop curb
  [-8, 0, 0], // west bank of the bridge
  [0, 0, 0], // Welcome Plaza — the road's center, the gate spans here
  [8, 0, 0], // east bank of the bridge
  [16, 0, 0], // cafe curb
  [26, 0, 0], // arcade curb
  [38, 0, 0], // sports-field curb
  [48, 0, 0], // open-road curb
  [58, 0, 0], // coming-soon curb
  [66, 0, 0], // Lakeside gateway (east end)
]
