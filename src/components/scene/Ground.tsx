import { useMemo } from 'react'
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
// perfect circle.
const PEAK_RING_RADIUS = 190
const PEAK_COUNT = 26
const FOOTHILL_RING_RADIUS = 150
const FOOTHILL_COUNT = 20

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
// Kept narrower in X than the suburb's outermost filler row (±23) — near
// the junction, Foundry's own nearest buildings start at x≈-20, and the two
// districts' near-junction footprints sit close enough together that a
// wider patch would paint grass under a downtown building. Covers real
// attractions (±9) and the inner filler row (±16) cleanly; the outermost
// row's far edge is the accepted trade-off.
const GRASS_SIZE: [number, number] = [34, 94]
const GRASS_CENTER: [number, number] = [0, 49]

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

/** PRD v4 §4.4/§7.4 — a real range: distant peaks + closer foothills, varied
 * cone side-count and jittered spacing (seeded, so still reproducible)
 * instead of one ring of identical 4-sided pyramids evenly spaced. */
function Mountains() {
  const { peaks, foothills } = useMemo(() => {
    const rand = mulberry32(20260921)
    return {
      peaks: ringOfPeaks(PEAK_COUNT, PEAK_RING_RADIUS, 30, [50, 110], rand),
      foothills: ringOfPeaks(FOOTHILL_COUNT, FOOTHILL_RING_RADIUS, 16, [30, 58], rand),
    }
  }, [])

  return (
    <group>
      {[...peaks, ...foothills].map((p, i) => (
        <mesh key={i} position={p.position} rotation={[0, p.rotationY, 0]}>
          <coneGeometry args={[p.width / 2, p.height, p.sides]} />
          <meshStandardMaterial color={PALETTE.mountain} fog />
        </mesh>
      ))}
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

      <PlazaSquare />
      <Suburb />
      <Park />
      <BasketballCourt />
      <Forest />
      <Mountains />
    </group>
  )
}
