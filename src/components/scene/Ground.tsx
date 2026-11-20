import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from '../../config'
import Forest from './Forest'
import PlazaSquare from './PlazaSquare'
import Suburb from './Suburb'
import Park from './Park'
import BasketballCourt from './BasketballCourt'
import DowntownPocketPark from './DowntownPocketPark'
import Yard from './Yard'
import River from './River'

// One base plane covers the Foundry, Lakeside, and Plaza arms.
const GROUND_SIZE: [number, number] = [260, 260]

// Bucket peaks by side count to vary silhouettes while keeping draw calls low.
const PEAK_RING_RADIUS = 190
const PEAK_COUNT = 34
const FOOTHILL_RING_RADIUS = 150
const FOOTHILL_COUNT = 26
const SIDE_BUCKETS = [4, 5, 6, 7] as const

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Extend the grass past the outer Lakeside housing rows.
const GRASS_SIZE: [number, number] = [100, 94]
const GRASS_CENTER: [number, number] = [0, 49]

// Cover both sides of the Foundry without paving the western Lakeside housing beyond the river.
const DOWNTOWN_GROUND_SIZE: [number, number] = [86, 96]
const DOWNTOWN_GROUND_CENTER: [number, number] = [-48, 0]
// Separate the pavement and grass heights where their footprints overlap to avoid z-fighting.
const DOWNTOWN_GROUND_Y = -0.028

interface Peak {
  position: [number, number, number]
  rotationY: number
  height: number
  width: number
  sides: number
}

function ringOfPeaks(count: number, baseRadius: number, radiusJitter: number, heightRange: [number, number], rand: () => number): Peak[] {
  const arr: Peak[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * (Math.PI / count)
    const radius = baseRadius + rand() * radiusJitter
    const height = heightRange[0] + rand() * (heightRange[1] - heightRange[0])
    const width = height * (0.55 + rand() * 0.35)
    const sides = 4 + Math.floor(rand() * 4) // 4..7 — varied silhouette, not identical pyramids
    arr.push({
      position: [Math.cos(angle) * radius, height / 2 - 4, Math.sin(angle) * radius],
      rotationY: rand() * Math.PI * 2,
      height,
      width,
      sides,
    })
  }
  return arr
}

/** Instance the peaks by side count so individual placement and scale stay varied. */
function Mountains() {
  const allPeaks = useMemo(() => {
    const rand = mulberry32(20260921)
    return [
      ...ringOfPeaks(PEAK_COUNT, PEAK_RING_RADIUS, 30, [50, 110], rand),
      ...ringOfPeaks(FOOTHILL_COUNT, FOOTHILL_RING_RADIUS, 16, [30, 58], rand),
    ]
  }, [])

  const bucketed = useMemo(() => {
    const groups = new Map<number, Peak[]>()
    for (const sides of SIDE_BUCKETS) groups.set(sides, [])
    for (const p of allPeaks) groups.get(p.sides)!.push(p)
    return groups
  }, [allPeaks])

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: PALETTE.mountain })
    m.fog = true
    return m
  }, [])

  // One canonical unit cone (radius 1, height 1) geometry per side-count
  // bucket, created once — not inline in the JSX below, which would hand
  // <Instances> a fresh geometry reference (and force a rebuild) every render.
  const geometries = useMemo(() => new Map(SIDE_BUCKETS.map((sides) => [sides, new THREE.ConeGeometry(1, 1, sides)])), [])

  return (
    <group>
      {SIDE_BUCKETS.map((sides) => {
        const peaks = bucketed.get(sides)!
        if (peaks.length === 0) return null
        // Each Instance's own scale reproduces that peak's real
        // width/height (ConeGeometry is centered at its own origin, so this
        // composes correctly with the same position.y = height/2 - 4
        // formula the uninstanced version used).
        return (
          <Instances key={sides} geometry={geometries.get(sides)} material={material}>
            {peaks.map((p, i) => (
              <Instance key={i} position={p.position} rotation={[0, p.rotationY, 0]} scale={[p.width / 2, p.height, p.width / 2]} />
            ))}
          </Instances>
        )
      })}
    </group>
  )
}

export default function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={GROUND_SIZE} />
        <meshStandardMaterial color={PALETTE.ground} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRASS_CENTER[0], -0.03, GRASS_CENTER[1]]} receiveShadow>
        <planeGeometry args={GRASS_SIZE} />
        <meshStandardMaterial color={PALETTE.moss} roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[DOWNTOWN_GROUND_CENTER[0], DOWNTOWN_GROUND_Y, DOWNTOWN_GROUND_CENTER[1]]} receiveShadow>
        <planeGeometry args={DOWNTOWN_GROUND_SIZE} />
        <meshStandardMaterial color={PALETTE.pavement} roughness={0.95} />
      </mesh>

      <PlazaSquare />
      <Suburb />
      <Yard />
      <Park />
      <BasketballCourt />
      <DowntownPocketPark />
      <River />
      <Forest />
      <Mountains />
    </group>
  )
}
