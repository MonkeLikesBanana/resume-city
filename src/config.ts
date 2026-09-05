import type { CameraShot } from './types/attraction'

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

/** PRD §7.3 — tuned once for the whole app, not per-shot. */
export const CAMERA = {
  smoothTime: 0.9,
  restThreshold: 0.01,
  draggingSmoothTime: 0.25,
}

/** PRD §7.3 — the aerial establishing shot the city opens on / returns to. */
export const OVERVIEW_SHOT: CameraShot = {
  cameraPosition: [58, 46, 72],
  cameraTarget: [-1, 2, 3],
}

/** PRD §7.3 computeDefaultShot() default footprint when an attraction doesn't specify one. */
export const DEFAULT_FOOTPRINT = 6
