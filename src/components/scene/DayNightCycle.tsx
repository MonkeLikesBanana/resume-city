import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { computeDayNight } from '../../lib/dayNight'
import { setWindowGlow } from '../../lib/windowGlow'

interface DayNightCycleProps {
  sunRef: React.RefObject<THREE.DirectionalLight | null>
  hemisphereRef: React.RefObject<THREE.HemisphereLight | null>
}

/** PRD v4 §7.4 — one useFrame loop owns the fog color, sun orbit, and light
 * intensity for the whole city (Sky.tsx separately owns the sky dome's own
 * gradient, since it's the component that actually paints what's visible —
 * see the note there). StreetLamp.tsx and the window-glow registry
 * (src/lib/windowGlow.ts) read the resulting `isNight` flag independently
 * rather than this component reaching into them. */
export default function DayNightCycle({ sunRef, hemisphereRef }: DayNightCycleProps) {
  const { scene } = useThree()
  const lastIsNight = useRef<boolean | null>(null)

  useFrame(({ clock }) => {
    const frame = computeDayNight(clock.getElapsedTime())

    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(frame.skyBottom)

    const sun = sunRef.current
    if (sun) {
      sun.color.copy(frame.sunColor)
      sun.intensity = frame.sunIntensity
      sun.position.set(...frame.sunPosition)
    }

    const hemisphere = hemisphereRef.current
    if (hemisphere) hemisphere.intensity = frame.ambientIntensity

    // Only touch materials when the boolean actually flips — no need to
    // re-set the same emissive values every frame.
    if (frame.isNight !== lastIsNight.current) {
      lastIsNight.current = frame.isNight
      setWindowGlow(frame.isNight)
    }
  })

  return null
}
