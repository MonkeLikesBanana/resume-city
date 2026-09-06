import * as THREE from 'three'
import { DAY_NIGHT_CYCLE_SECONDS } from '../config'

/** PRD v4 §7.4 — computed fresh each frame from elapsed time, not driven by
 * React state (a value that changes every frame has no business going
 * through reconciliation). `isNight` is read directly by StreetLamp.tsx and
 * the window-glow system (src/lib/windowGlow.ts) via this same mutable
 * object each frame, instead of prop-drilling or a zustand subscription. */
export const dayNightState = { isNight: false }

const NIGHT = { sky: new THREE.Color('#0a1128'), horizon: new THREE.Color('#1a2744'), sun: new THREE.Color('#3a4a7a'), sunIntensity: 0.15, ambient: 0.12 }
const DAY = { sky: new THREE.Color('#8fb8d4'), horizon: new THREE.Color('#d9cfae'), sun: new THREE.Color('#fff6e8'), sunIntensity: 1.7, ambient: 0.55 }
const WARM = new THREE.Color('#ff8a4c') // dawn/dusk tint, blended in near the horizon crossing

const NIGHT_THRESHOLD = -0.05 // sun elevation below this counts as "night" for streetlamps/window glow

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export interface DayNightFrame {
  skyTop: THREE.Color
  skyBottom: THREE.Color
  sunColor: THREE.Color
  sunIntensity: number
  ambientIntensity: number
  sunPosition: [number, number, number]
  isNight: boolean
}

const _skyTop = new THREE.Color()
const _skyBottom = new THREE.Color()
const _sunColor = new THREE.Color()

/** Pure function of elapsed time — no side effects, so it's cheap to call
 * from multiple places (DayNightCycle mutates the scene with the result;
 * nothing else needs to duplicate this math). */
// A fresh page load starts the clock at elapsed=0 — offsetting the phase so
// that lands at noon (not midnight) means every first impression is the
// bright, inviting view already established, with night something a visitor
// exploring for a couple of minutes discovers rather than opens into.
const PHASE_OFFSET = 0.5

export function computeDayNight(elapsedSeconds: number): DayNightFrame {
  const phase = ((elapsedSeconds / DAY_NIGHT_CYCLE_SECONDS + PHASE_OFFSET) % 1 + 1) % 1
  const angle = phase * Math.PI * 2
  const elevation = -Math.cos(angle) // -1 at phase 0 (midnight), +1 at phase 0.5 (noon)

  const d = smoothstep(-0.3, 0.5, elevation) // 0 = full night, 1 = full day
  const warmth = Math.max(0, 1 - Math.abs(d - 0.5) * 2) // peaks exactly at the day/night crossing

  _skyTop.lerpColors(NIGHT.sky, DAY.sky, d)
  _skyBottom.lerpColors(NIGHT.horizon, DAY.horizon, d).lerp(WARM, warmth * 0.55)
  _sunColor.lerpColors(NIGHT.sun, DAY.sun, d).lerp(WARM, warmth * 0.6)

  const sunIntensity = THREE.MathUtils.lerp(NIGHT.sunIntensity, DAY.sunIntensity, d)
  const ambientIntensity = THREE.MathUtils.lerp(NIGHT.ambient, DAY.ambient, d)

  const sunDistance = 90
  const sunX = Math.cos(angle - Math.PI / 2) * sunDistance
  const sunY = Math.max(3, elevation * 55)
  const sunZ = 25

  const isNight = elevation < NIGHT_THRESHOLD
  dayNightState.isNight = isNight

  return {
    skyTop: _skyTop,
    skyBottom: _skyBottom,
    sunColor: _sunColor,
    sunIntensity,
    ambientIntensity,
    sunPosition: [sunX, sunY, sunZ],
    isNight,
  }
}
