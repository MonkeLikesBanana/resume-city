// PRD §8 — Data Model. Single source of truth for every attraction lives in
// src/content/attractions.ts; every other part of the app (hotspots, panels,
// breadcrumb, routes, tour order, accessible nav) is generated from that array.

export type District = 'foundry' | 'lakeside' | 'plaza'
export type Vec3 = [number, number, number]

// PRD v3 §7.1 — the road is a 3-arm junction (Foundry west, Lakeside south,
// a short Plaza spur into the home vantage), not one linear path. Arm and
// District are the same union deliberately — every attraction's own district
// is also the name of the arm its curb point defaults onto (src/lib/roadGraph.ts).
export type Arm = District
export interface RoadPosition {
  arm: Arm
  t: number // 0 at the junction (world origin), 1 at the arm's far end
}

export interface TimelineEntry {
  role: string
  dateRange: string
  description: string
}

export interface Attraction {
  /** slug, used in the URL: /foundry/robotics-workshop */
  id: string
  district: District
  name: string
  subtitle: string
  /** world placement, y is almost always 0 */
  position: Vec3
  /** meters, post-scale. Drives the arrival tilt angle (PRD v2 §7.3) —
   * replaces v1's footprint-based camera-distance formula. */
  height: number
  /** optional override: where the car parks. Default: nearest point on this
   * attraction's own district's arm to `position` (PRD v3 §7.2). Only set
   * this if the automatic nearest-point pick looks wrong — the Welcome
   * Plaza's `curb` MUST be set explicitly (its `position` sits near the
   * junction for tilt-target purposes, not out at the parked vantage point). */
  curb?: RoadPosition
  rotationY?: number
  scale?: number
  /** path to .glb under /public/assets/models/. Optional — the Welcome
   * Plaza is a camera+UI-only hub with no single physical building. */
  model?: string
  /** for multi-role stops (Robotics Workshop) */
  timeline?: TimelineEntry[]
  /** for single-blurb stops (NEEMO, interests) */
  description?: string
  /** freeform bullets (GPA, AP scores, etc.) */
  facts?: string[]
  tags: string[]
  accentColor: 'foundry' | 'lakeside'
}

/** PRD v2 §4.1/§8 — purely decorative downtown filler: no content, no
 * hotspot, no route entry, never appears in AccessibleNav. */
export interface FillerBuilding {
  model: string
  position: Vec3
  rotationY?: number
  scale?: number
}
