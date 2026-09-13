import type { Vec3 } from '../../types/attraction'

/** PRD v6.0 §4 — same reasoning as Bench.tsx: no Kenney pack on disk has a
 * trash can, built from primitives instead. A real city sidewalk has one
 * roughly every block; this fills that specific "no empty space" gap. */
const BODY_COLOR = '#4a5a4a'
const LID_COLOR = '#3a3a3f'

interface TrashCanProps {
  position: Vec3
  rotationY?: number
}

export default function TrashCan({ position, rotationY = 0 }: TrashCanProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.6, 12]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 12]} />
        <meshStandardMaterial color={LID_COLOR} roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  )
}
