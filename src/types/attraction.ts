// PRD §8 — Data Model. Single source of truth for every attraction lives in
// src/content/attractions.ts; every other part of the app (hotspots, panels,
// breadcrumb, routes, tour order, accessible nav) is generated from that array.

export type District = 'foundry' | 'lakeside' | 'plaza'
export type Vec3 = [number, number, number]

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
  /** optional override: 0..1 progress along ROAD_PATH where the car parks.
   * Default: nearest point on the road to `position` (PRD v2 §7.2). Only set
   * this if the automatic nearest-point pick looks wrong. */
  curbT?: number
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
