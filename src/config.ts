export const CITY_NAME = 'Vasnova City'

export const DISTRICT_NAMES = {
  foundry: 'The Foundry District',
  lakeside: 'Lakeside',
  plaza: 'Welcome Plaza',
} as const

/** Pacific NW Tech City palette — PRD §4. Mirrors the Tailwind @theme tokens in
 * globals.css; kept here too because three.js scene code needs real color
 * values, not CSS custom properties. */
export const PALETTE = {
  skyTop: '#B8D4E3',
  skyBottom: '#F0E6D2',
  evergreen: '#2D5843',
  moss: '#4A7856',
  mountain: '#7C93A3',
  lake: '#3E7CA6',
  ground: '#F4F1EA',
  foundry: '#2EC4B6',
  lakeside: '#C97B4A',
  ink: '#1F2A24',
  /** Sidewalk/plaza paving — shared by RoadNetwork.tsx and PlazaSquare.tsx
   * so both read as the same city pavement material. Deliberately darker
   * than an earlier lighter grey (#c7c2b8): that one read fine at the
   * Plaza's own oblique framing but washed out to nearly the same color as
   * the base `ground` tone at a grazing viewing angle (a car parked at the
   * curb looking almost horizontally at a short building sees mostly this
   * near-ground plane) — found via a diagnostic bright-color swap, not
   * assumed from a screenshot that happened to look fine. */
  pavement: '#a8a29a',
} as const

/** Accent color as a UI fill/border (buttons, chip backgrounds, hotspot
 * markers) — always paired with dark ink text, which passes AA against
 * either accent at this brightness. */
export const ACCENT_FILL = {
  foundry: '#2EC4B6',
  lakeside: '#C97B4A',
} as const

/** Accent color as TEXT directly on the cream ground color (e.g. the
 * district eyebrow label in InfoPanel). The bright ACCENT_FILL hexes above
 * fail WCAG AA as text on this light a background (~2:1) — these are
 * darkened versions of the same hues that clear 4.5:1 (§10). */
export const ACCENT_TEXT = {
  foundry: '#0E6E63',
  lakeside: '#8A4B26',
} as const

/** PRD v3 §7.7 — every attraction uses DEFAULT_FOV; the Welcome Plaza alone
 * uses the wider HOME_FOV, since it's the one shot that needs to hold both
 * 90°-apart districts in frame at once. CameraRig lerps between the two over
 * the course of a trip (§7.3), the same eased progress that drives position. */
export const DEFAULT_FOV = 55
export const HOME_FOV = 75

/** PRD v2 §7.2 — fixed camera height above the road surface, every stop, while
 * driving and while parked. Replaces v1's per-building camera positioning. */
export const CAR_EYE_HEIGHT = 2

/** PRD v2 §7.3 — how far up a building's height the arrival tilt looks (0.6 =
 * roughly two-thirds up the facade). One constant, not a per-building value —
 * that's the whole point of retiring v1's hand-tuned camera overrides. */
export const ARRIVAL_TILT_FRACTION = 0.6

/** PRD v4 §7.2 — a real accelerate/cruise/decelerate velocity profile
 * (src/lib/motion.ts), replacing v3's flat DRIVE_SPEED constant fed through
 * one easeInOutCubic. MAX_SPEED is deliberately much slower than v3's
 * effective ~26 units/sec — at that speed most trips completed in well
 * under a second, too fast to read as anything but a snap no matter how
 * smooth the underlying easing math was. ACCEL also governs the
 * explore-yourself scrub's ramp up/down (§7.5) — the same "feels like one
 * car" constant in both places. */
export const MAX_SPEED = 10 // units/sec
export const ACCEL = 6 // units/sec²

/** PRD v2 §7.4 — the Plaza is the home state (v1's free aerial OVERVIEW_SHOT
 * is retired). This is the id CameraRig drives to for "/" and "back to city". */
export const HOME_ATTRACTION_ID = 'welcome-plaza'

/** PRD v4 §7.4 — a full day/night loop, continuous, repeating. */
export const DAY_NIGHT_CYCLE_SECONDS = 90
