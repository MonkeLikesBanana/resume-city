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

export interface CameraShot {
  cameraPosition: Vec3
  cameraTarget: Vec3
}

export interface Attraction {
  /** slug, used in the URL: /foundry/robotics-workshop */
  id: string
  district: District
  name: string
  subtitle: string
  /** world placement, y is almost always 0 */
  position: Vec3
  rotationY?: number
  scale?: number
  /** path to .glb under /public/assets/models/. Optional — the Welcome
   * Plaza is a camera+UI-only hub with no single physical building (PRD §5.0
   * doesn't map it to one; left as a prop-decorated point in the scene). */
  model?: string
  /** override computeDefaultShot() — use for flagship stops */
  cameraShot?: CameraShot
  /** for multi-role stops (Robotics Workshop) */
  timeline?: TimelineEntry[]
  /** for single-blurb stops (NEEMO, interests) */
  description?: string
  /** freeform bullets (GPA, AP scores, etc.) */
  facts?: string[]
  tags: string[]
  accentColor: 'foundry' | 'lakeside'
  /** footprint in meters, used by computeDefaultShot() — PRD §7.3 */
  footprint?: number
}
