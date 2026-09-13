import type { Vec3 } from '../../types/attraction'

/** PRD v6.0 §4 — no Kenney pack on disk has a park bench (same situation
 * BasketballCourt.tsx already solved for a hoop/court), so this is built
 * from primitive geometry: a seat, a backrest, and two A-frame legs. Real
 * proportions (seat ~0.45m high, ~1.4m long) at the low-poly, slightly
 * blocky scale the rest of the city uses. */
const SEAT_COLOR = '#8a6a4a'
const FRAME_COLOR = '#3a3a3f'
const LENGTH = 1.4
const SEAT_Y = 0.45

interface BenchProps {
  position: Vec3
  rotationY?: number
}

export default function Bench({ position, rotationY = 0 }: BenchProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, SEAT_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[LENGTH, 0.05, 0.4]} />
        <meshStandardMaterial color={SEAT_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[0, SEAT_Y + 0.25, -0.17]} castShadow>
        <boxGeometry args={[LENGTH, 0.5, 0.05]} />
        <meshStandardMaterial color={SEAT_COLOR} roughness={0.85} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (LENGTH / 2 - 0.08), 0, 0]}>
          <mesh position={[0, SEAT_Y / 2, 0.15]} castShadow>
            <boxGeometry args={[0.05, SEAT_Y, 0.05]} />
            <meshStandardMaterial color={FRAME_COLOR} />
          </mesh>
          <mesh position={[0, SEAT_Y / 2, -0.15]} castShadow>
            <boxGeometry args={[0.05, SEAT_Y, 0.05]} />
            <meshStandardMaterial color={FRAME_COLOR} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
