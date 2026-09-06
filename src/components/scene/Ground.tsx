import { useMemo } from 'react'
import { PALETTE } from '../../config'
import Building from './Building'
import Forest from './Forest'

const LAKE_HALF_WIDTH = 6 // x: -6..6, PRD §4 "stylized lake physically separating the two districts"
// Kept short enough (z: -25..25) to clear the forest bands (§4.2, |z| >= 28) —
// the lake separates the two districts near Main Street, it doesn't need to
// run the length of the whole forest.
const LAKE_LENGTH = 50
// PRD v2 §4.1 — Main Street now runs from x=-76 (Foundry gateway) to x=66
// (Lakeside gateway); ground/mountains widened to match plus a forest buffer.
const GROUND_SIZE: [number, number] = [240, 160]

const MOUNTAIN_RING_RADIUS = 150
const MOUNTAIN_COUNT = 18

/** Simple low-poly mountain silhouette: a ring of 4-sided pyramids far
 * beyond the playable area. PRD §4 "Cascade-style mountain silhouette" —
 * generated procedurally rather than modeled, kept in-fog for atmosphere. */
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

/** PRD §7.3 "the bridge crossing near the Welcome Plaza" — a short chain of
 * road-bridge tiles across the lake gap, with pillars for support. */
function Bridge() {
  const scale = 3
  const tileSpan = 1 * scale // road-bridge.glb is a 1x1 raw tile
  const tileCount = Math.ceil((LAKE_HALF_WIDTH * 2) / tileSpan)
  const start = -((tileCount - 1) * tileSpan) / 2

  return (
    <group>
      {Array.from({ length: tileCount }, (_, i) => (
        <Building key={i} model="/assets/models/bridge-deck.glb" position={[start + i * tileSpan, 0, 0]} scale={scale} />
      ))}
      <Building model="/assets/models/bridge-pillar.glb" position={[-3, -1.2, 0]} scale={scale} />
      <Building model="/assets/models/bridge-pillar.glb" position={[3, -1.2, 0]} scale={scale} />
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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[LAKE_HALF_WIDTH * 2, LAKE_LENGTH]} />
        <meshStandardMaterial color={PALETTE.lake} transparent opacity={0.88} roughness={0.3} metalness={0.1} />
      </mesh>

      <Bridge />
      <Forest />
      <Mountains />
    </group>
  )
}
