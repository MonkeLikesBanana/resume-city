export const CITY_NAME = 'Vasnova City'

export const DISTRICT_NAMES = {
  foundry: 'The Foundry District',
  lakeside: 'Lakeside',
  plaza: 'Welcome Plaza',
} as const

/** Mirror the CSS palette with literal colors for Three.js materials and shaders. */
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
  /** The travel-lane surface of Main Street/the Lakeside street — a plain
   * flat plane (RoadNetwork.tsx's roadSurfaces()), not a kit road tile. The
   * kit's road-side.glb/road-straight.glb share one flat color-swatch atlas
   * and tile into a busy alternating light/dark band across the whole road
   * width, not a clean asphalt surface — same "just paint it as its own flat
   * plane" fix already used for `pavement`/`moss`. */
  asphalt: '#404046',
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
 * darkened versions of the same hues that clear 4.5:1. */
export const ACCENT_TEXT = {
  foundry: '#0E6E63',
  lakeside: '#8A4B26',
} as const

/** Use a wider Plaza field of view so both roads fit from the home curb. */
export const DEFAULT_FOV = 55
export const HOME_FOV = 75

export const CAR_EYE_HEIGHT = 2

/** Aim up the building by a fraction of its height so arrival framing scales with the facade. */
export const ARRIVAL_TILT_FRACTION = 0.6

/** Share acceleration and speed settings between automatic drives and manual scrubbing. */
export const MAX_SPEED = 10 // units/sec
export const ACCEL = 6 // units/sec²

export const HOME_ATTRACTION_ID = 'welcome-plaza'
