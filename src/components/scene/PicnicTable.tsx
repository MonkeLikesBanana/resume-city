import type { Vec3 } from '../../types/attraction'

/** PRD v6.0 §4 — same reasoning as Bench.tsx: a picnic table for the Park,
 * built from primitives (a tabletop plus two bench seats, A-frame legs
 * shared between them, the classic single-piece park picnic table shape). */
const WOOD_COLOR = '#8a6a4a'
const FRAME_COLOR = '#5a4632'
const LENGTH = 1.6
const TABLE_Y = 0.7
const SEAT_Y = 0.42

interface PicnicTableProps {
  position: Vec3
  rotationY?: number
}

export default function PicnicTable({ position, rotationY = 0 }: PicnicTableProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, TABLE_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[LENGTH, 0.05, 0.6]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, SEAT_Y, side * 0.45]} castShadow receiveShadow>
          <boxGeometry args={[LENGTH, 0.05, 0.25]} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (LENGTH / 2 - 0.15), 0, 0]}>
          <mesh position={[0, TABLE_Y / 2, 0.4]} rotation={[0.15 * -side, 0, 0]} castShadow>
            <boxGeometry args={[0.05, TABLE_Y, 0.05]} />
            <meshStandardMaterial color={FRAME_COLOR} />
          </mesh>
          <mesh position={[0, TABLE_Y / 2, -0.4]} rotation={[0.15 * side, 0, 0]} castShadow>
            <boxGeometry args={[0.05, TABLE_Y, 0.05]} />
            <meshStandardMaterial color={FRAME_COLOR} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
