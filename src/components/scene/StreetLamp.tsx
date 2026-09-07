import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Building from './Building'
import { dayNightState } from '../../lib/dayNight'
import type { Vec3 } from '../../types/attraction'

interface StreetLampProps {
  model: string
  position: Vec3
  rotationY?: number
  scale?: number
  /** world-space height of the lamp head above `position`, for the light's
   * own position — varies per model (light-square vs. the curved style). */
  lampHeight?: number
  /** a fixed per-instance offset (0..1) so lamps don't all flicker in
   * lockstep — that would read as a synchronized effect, not incidental. */
  flickerSeed?: number
}

const LIT_INTENSITY = 9
const LIGHT_RANGE = 26
const LIGHT_DECAY = 1.5 // real inverse-square (2) reads as near-pinpoint at low-poly city scale — softer decay lets one lamp actually carry the sidewalk around it
const FLICKER_CHANCE_PER_SECOND = 0.15
const FLICKER_DEPTH = 0.55 // how far intensity dips during a flicker, 0..1
// PRD v5.0 §4.7 — every lamp turning on together at dusk read as a stage
// cue, not a real city (some lights are always off — no one's there, the
// bulb's out). About a third of lamps stay dark for the whole night now,
// picked via flickerSeed (already a per-instance 0..1 value, so this is
// free — no new prop, no extra randomness source) rather than re-rolled
// per night cycle: a *specific* lamp being the flickery/broken one reads
// as more real than the set of broken lamps shuffling every cycle, and is
// far simpler to reason about (no cycle-index tracking needed).
const DARK_FRACTION = 0.33
const FLICKER_ON_CHANCE_PER_SECOND = 0.05 // a dark lamp's chance to briefly flicker on — lower than a lit lamp's chance to flicker off, so darkness still reads as the stable state

/** PRD v4 §4.4/§7.4/§9 — a lamp model plus a real, non-shadow-casting
 * PointLight at the lamp head, intensity driven by the day/night cycle
 * (src/lib/dayNight.ts) rather than React state — this runs at 60fps and
 * has no business going through reconciliation. Occasionally, while lit,
 * briefly dips intensity for a flicker; the per-instance seed keeps lamps
 * from flickering in unison. No shadow casting (PRD §12 — the sun remains
 * the only shadow-casting light; a real-time shadow map per streetlamp
 * would be a very different, much higher cost category).
 *
 * PRD v5.0 §4.7 — DARK_FRACTION of lamps (by flickerSeed) spend the night
 * dark instead of lit, with the same flicker mechanic running in reverse:
 * a small per-second chance to briefly flicker *on* rather than off. */
export default function StreetLamp({ model, position, rotationY = 0, scale = 1, lampHeight = 3, flickerSeed = 0 }: StreetLampProps) {
  const lightRef = useRef<THREE.PointLight>(null)
  const flickerRef = useRef(0) // seconds remaining in the current flicker
  const phaseRef = useRef(flickerSeed * 1000)
  const isDarkTonight = flickerSeed < DARK_FRACTION

  useFrame((_, delta) => {
    const light = lightRef.current
    if (!light) return
    phaseRef.current += delta

    if (!dayNightState.isNight) {
      light.intensity = THREE.MathUtils.damp(light.intensity, 0, 4, delta)
      return
    }

    if (isDarkTonight) {
      if (flickerRef.current > 0) {
        flickerRef.current -= delta
        light.intensity = THREE.MathUtils.damp(light.intensity, LIT_INTENSITY * (1 - FLICKER_DEPTH), 8, delta)
      } else {
        light.intensity = THREE.MathUtils.damp(light.intensity, 0, 4, delta)
        if (Math.random() < FLICKER_ON_CHANCE_PER_SECOND * delta) {
          flickerRef.current = 0.08 + ((phaseRef.current * 37) % 0.12)
        }
      }
      return
    }

    if (flickerRef.current > 0) {
      flickerRef.current -= delta
      light.intensity = LIT_INTENSITY * (1 - FLICKER_DEPTH)
    } else {
      light.intensity = THREE.MathUtils.damp(light.intensity, LIT_INTENSITY, 4, delta)
      // Deterministic-feeling but effectively random: a low per-second
      // chance to start a brief flicker, offset per-instance via the seed
      // so simultaneous checks across many lamps don't all land the same way.
      if (Math.random() < FLICKER_CHANCE_PER_SECOND * delta) {
        flickerRef.current = 0.08 + ((phaseRef.current * 37) % 0.12)
      }
    }
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Building model={model} position={[0, 0, 0]} rotationY={0} scale={scale} />
      <pointLight ref={lightRef} position={[0, lampHeight, 0]} color="#ffcf8a" intensity={0} distance={LIGHT_RANGE} decay={LIGHT_DECAY} castShadow={false} />
    </group>
  )
}
