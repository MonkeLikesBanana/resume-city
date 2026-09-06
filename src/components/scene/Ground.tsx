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
const MOUNTAIN_RING_RADIUS = 175
const MOUNTAIN_COUNT = 22

/** Simple low-poly mountain silhouette: a ring of 4-sided pyramids far
 * beyond the playable area. Generated procedurally, kept in-fog for atmosphere. */
function Mountains() {
  const peaks = useMemo(() => {
    const arr = []
    for (let i = 0; i < MOUNTAIN_COUNT; i++) {
      const angle = (i / MOUNTAIN_COUNT) * Math.PI * 2 + (i % 2 === 0 ? 0.08 : -0.05)
      const radius = MOUNTAIN_RING_RADIUS + (i % 3) * 18
      const height = 46 + (i % 4) * 18
      const width = 34 + (i % 5) * 10
      arr.push({
        position: [Math.cos(angle) * radius, height / 2 - 4, Math.sin(angle) * radius] as [number, number, number],
        height,
        width,
      })
    }
    return arr
  }, [])

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={p.position} rotation={[0, (i * Math.PI) / 5, 0]}>
          <coneGeometry args={[p.width / 2, p.height, 4]} />
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

      <PlazaSquare />
      <Suburb />
      <Park />
      <BasketballCourt />
      <Forest />
      <Mountains />
    </group>
  )
}
