import Building from './Building'
import Bench from './Bench'
import PicnicTable from './PicnicTable'
import TrashCan from './TrashCan'
import { PALETTE } from '../../config'

/** PRD v3 §4.4 — a real park lot along the Lakeside street: a grass patch,
 * a winding path, a small pond with a decorative footbridge (the relocated
 * "Lakeside should have a lake" feature, §4.2), park-style deciduous trees
 * (visibly different from the forest's pine silhouette — that's deliberate,
 * a park should read differently from the wild forest belt behind it),
 * flowers, and rustic tree-stump seating alongside real benches/a picnic
 * table (PRD v6.0 §1 — Bench.tsx/PicnicTable.tsx, built from primitives
 * the same way BasketballCourt.tsx's hoop was, since no pack on disk has
 * park furniture — the stumps were the only seating option before that). */
const CENTER: [number, number] = [32, 45]
const [cx, cz] = CENTER

export default function Park() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.015, cz]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color={PALETTE.moss} roughness={1} />
      </mesh>

      {/* Winding path through the lot */}
      <Building model="/assets/models/ground-path-straight.glb" position={[cx - 6, 0, cz]} scale={3} />
      <Building model="/assets/models/ground-path-bend.glb" position={[cx - 3, 0, cz]} scale={3} />
      <Building model="/assets/models/ground-path-straight.glb" position={[cx - 3, 0, cz - 3]} scale={3} rotationY={Math.PI / 2} />
      <Building model="/assets/models/ground-path-corner.glb" position={[cx, 0, cz - 3]} scale={3} />
      <Building model="/assets/models/ground-path-straight.glb" position={[cx + 3, 0, cz - 3]} scale={3} />

      {/* Small pond + footbridge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx + 6, 0.02, cz + 5]}>
        <circleGeometry args={[3.2, 24]} />
        <meshStandardMaterial color={PALETTE.lake} transparent opacity={0.88} roughness={0.3} metalness={0.1} />
      </mesh>
      <Building model="/assets/models/bridge-wood.glb" position={[cx + 6, 0, cz + 5]} scale={2.5} rotationY={Math.PI / 4} />

      {/* Trees, flowers, rustic seating, landscaping rocks */}
      <Building model="/assets/models/tree-large.glb" position={[cx - 8, 0, cz + 7]} scale={3.2} />
      <Building model="/assets/models/tree-large.glb" position={[cx + 8, 0, cz - 8]} scale={3} rotationY={1.2} />
      <Building model="/assets/models/tree-small.glb" position={[cx - 7, 0, cz - 7]} scale={3} />
      <Building model="/assets/models/tree-small.glb" position={[cx + 3, 0, cz + 8]} scale={2.8} rotationY={2.1} />
      <Building model="/assets/models/flower-red.glb" position={[cx - 2, 0, cz + 2]} scale={2.5} />
      <Building model="/assets/models/flower-yellow.glb" position={[cx - 1, 0, cz + 3]} scale={2.5} />
      <Building model="/assets/models/flower-purple.glb" position={[cx - 3, 0, cz + 1]} scale={2.5} />
      <Building model="/assets/models/stump-round.glb" position={[cx + 1, 0, cz - 5]} scale={2.5} />
      <Building model="/assets/models/stump-square.glb" position={[cx - 1, 0, cz - 6]} scale={2.5} />
      <Building model="/assets/models/rock-small-a.glb" position={[cx + 8, 0, cz + 2]} scale={2.5} />
      <Building model="/assets/models/rock-small-b.glb" position={[cx - 9, 0, cz - 2]} scale={2.5} />

      <Bench position={[cx + 3.5, 0, cz + 4]} rotationY={-0.9} />
      <PicnicTable position={[cx - 5, 0, cz - 8]} rotationY={0.3} />
      <TrashCan position={[cx - 2.5, 0, cz - 3]} />
    </group>
  )
}
