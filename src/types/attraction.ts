
export type District = 'foundry' | 'lakeside' | 'plaza'
export type Vec3 = [number, number, number]

// Each district has a corresponding road arm for parking.
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
  placeName?: string
  subtitle: string
  /** world placement, y is almost always 0 */
  position: Vec3
  /** Model height in meters after scaling. Used to frame the stop on arrival. */
  height: number
  /** Override the nearest point on the district road when a stop needs a specific view. */
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
  links?: { label: string; href: string }[]
  tags: string[]
  accentColor: 'foundry' | 'lakeside'
}

/** Scene decoration with no corresponding résumé entry. */
export interface FillerBuilding {
  model: string
  position: Vec3
  rotationY?: number
  scale?: number
}
