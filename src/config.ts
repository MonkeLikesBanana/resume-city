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

/** PRD v2 §7.3 — tuned once for the whole app, not per-shot. Only used for
 * phase 2 (the damped "arrive and tilt" transition) — phase 1 (driving) writes
 * the camera directly and doesn't go through CameraControls' easing at all. */
export const CAMERA = {
  smoothTime: 0.7,
  restThreshold: 0.01,
}

/** PRD v2 §7.2 — fixed camera height above the road surface, every stop, while
 * driving and while parked. Replaces v1's per-building camera positioning. */
export const CAR_EYE_HEIGHT = 2

/** PRD v2 §7.3 — how far up a building's height the arrival tilt looks (0.6 =
 * roughly two-thirds up the facade). One constant, not a per-building value —
 * that's the whole point of retiring v1's hand-tuned camera overrides. */
export const ARRIVAL_TILT_FRACTION = 0.6

/** Meters/second the camera travels along the road during phase 1 (PRD v2
 * §7.3) — used to derive drive duration from distance so a short hop (e.g.
 * across the bridge) doesn't take as long as the full Main Street traverse. */
export const DRIVE_SPEED = 26

/** PRD v2 §7.4 — the Plaza is the home state (v1's free aerial OVERVIEW_SHOT
 * is retired). This is the id CameraRig drives to for "/" and "back to city". */
export const HOME_ATTRACTION_ID = 'welcome-plaza'
