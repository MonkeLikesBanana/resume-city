import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from '../../config'
import Forest from './Forest'
import PlazaSquare from './PlazaSquare'
import Suburb from './Suburb'
import Park from './Park'
import BasketballCourt from './BasketballCourt'

// PRD v3 §4.1/§4.3/§4.4/§7.1 — the world is now an L-shape (Foundry west,
// Lakeside south) plus the Plaza's open square in the +X,-Z quadrant, not a
// single symmetric east-west corridor. A single large square ground plane
// centered on the junction comfortably covers all three arms plus the
// square; v2's separate lake+bridge is retired (§4.3) — Lakeside gets its
// own small pond instead (Park.tsx), since the two districts no longer share
// a water crossing between them.
const GROUND_SIZE: [number, number] = [260, 260]

// PRD v4 §4.4/§7.4 — two depth layers (distant peaks + closer foothills)
// with varied silhouettes, replacing v3's single ring of identical 4-sided
// cones — a real mountain range doesn't look like one shape repeated on a
// perfect circle. Properly instanced by bucketing peaks into a handful of
// side-count groups (one drei <Instances> draw call per bucket, §12) rather
// than the first pass's fix of just cutting the peak count in half to claw
// back Lighthouse's mobile Total Blocking Time — that was treating the
// symptom (too many individually-meshed objects) instead of the actual
// cause (not instanced at all). Fixing the root cause instead means the
// count can go back up, not just recover to where it started.
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

// PRD v4 §4.3 — a green grass patch covering the Lakeside arm's footprint,
// layered just above the base ground plane. This is the single biggest
// reason the suburb didn't yet read as a suburb from a still frame — same
// cream/tan ground as downtown everywhere, regardless of building density.
// Widened to the suburb's full outer-row extent (±23) after checking actual
// building footprints, not just lot-center coordinates: Foundry's nearest
// lot (x=-20, z=16) is only ~3m wide at its placement scale, so its
// footprint (~-21.5 to -18.5) doesn't reach the suburb's own outer edge —
// an earlier, more conservative pass narrowed this to ±17 assuming lot
// centers alone were close enough to collide, which overstated the risk.
// PRD v4 polish round 5 §4 — widened from [48,94]: suburb-houses.ts grew two
// more depth rows (to ±37, up from ±23), so the grass patch's old ±24
// half-width left the two new outer rows sitting on the base cream ground
// color instead of grass (exactly the "many suburbs still don't have
// grass" report — those houses were simply outside the patch, not a
// missing-material bug).
const GRASS_SIZE: [number, number] = [96, 94]
const GRASS_CENTER: [number, number] = [0, 49]

// PRD v4 polish round 5 §4 — the same "some ground has no proper surface"
// problem, downtown side: Foundry's filler buildings sat directly on the
// base cream ground plane (PALETTE.ground) with no paved surface of their
// own, the same gap the grass patch fixes for the suburb. One rectangle
// covering the full downtown footprint (foundry-blocks.ts now reaches
// z=±47, §3) reads as a continuous paved city block — real downtowns are
// pavement between buildings, not bare ground — and shares PALETTE.pavement
// with the sidewalks/plaza it sits flush next to, rather than introducing a
// third ground tone.
const DOWNTOWN_GROUND_SIZE: [number, number] = [86, 112]
const DOWNTOWN_GROUND_CENTER: [number, number] = [-48, 0]
// PRD v5.0 §4.6 — this patch's bounds spatially overlap GRASS_SIZE's (both
// districts' filler can reach the same near-junction quadrant, §4.6's wedge
// note) — at the *same* height (both were -0.03) that's real z-fighting,
// not a rendering artifact, confirmed by computing both rectangles'
// actual overlap. A fractionally higher pavement height resolves it
// deterministically instead of leaving it to GPU rounding.
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

/** PRD v4 §4.4/§7.4/§12 — a real range: distant peaks + closer foothills,
 * varied cone side-count and jittered spacing (seeded, so still
 * reproducible) instead of one ring of identical 4-sided pyramids evenly
 * spaced — and properly instanced despite the varied side-count, by
 * bucketing peaks into SIDE_BUCKETS groups and giving each bucket its own
 * canonical-size geometry (one drei <Instances> draw call per bucket, four
 * total, regardless of how many dozen peaks exist) — the same reasoning
 * Forest.tsx already applies to trees, extended to handle a per-instance
 * geometry variation (side count) that a single shared geometry can't. */
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
      <Park />
      <BasketballCourt />
      <Forest />
      <Mountains />
    </group>
  )
}
