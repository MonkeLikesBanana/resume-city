import Building from './Building'

/** PRD v3 §4.3 — the Welcome Plaza is now an open paved square occupying the
 * "outside" corner of the junction (+X,-Z — the quadrant neither arm claims),
 * not a gate spanning a bridge. The existing kitbashed arch moves to mark
 * the Foundry arm's entrance specifically (a monumental downtown gateway
 * makes sense where downtown starts); the Lakeside arm gets a lighter,
 * residential-appropriate transition instead of a matching monument. */
const SQUARE_SIZE: [number, number] = [40, 40]
const SQUARE_CENTER: [number, number] = [16, -16] // +X,-Z quadrant

const GATE_X = -10 // just past the junction, onto Main Street proper

export default function PlazaSquare() {
  return (
    <group>
      {/* Distinct paving so the square reads as a real plaza, not more plain
          ground — a stone-grey, not PALETTE.ground (that's the exact same
          color as the base ground plane and would be invisible) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.01, SQUARE_CENTER[1]]} receiveShadow>
        <planeGeometry args={SQUARE_SIZE} />
        <meshStandardMaterial color="#c7c2b8" roughness={0.95} />
      </mesh>

      {/* Foundry gateway — the existing arch, spanning Main Street (unchanged
          local orientation: columns flank a road running along X) */}
      <Building model="/assets/models/plaza-gate.glb" position={[GATE_X, 0, 0]} scale={1} />
      <Building model="/assets/models/planter.glb" position={[GATE_X + 0.8, 0, -2.8]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[GATE_X - 0.8, 0, 2.8]} scale={2.5} rotationY={Math.PI} />
      <Building model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, -3]} scale={2.5} />
      <Building model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, 3]} scale={2.5} rotationY={Math.PI} />
      <Building model="/assets/models/streetlamp.glb" position={[-1.5, 0, -3]} scale={2.5} />
      <Building model="/assets/models/streetlamp.glb" position={[-1.5, 0, 3]} scale={2.5} rotationY={Math.PI} />

      {/* Lakeside transition — flanking trees/planters, no monument (§4.3) */}
      <Building model="/assets/models/planter.glb" position={[-2.8, 0, 7]} scale={2.5} rotationY={Math.PI / 2} />
      <Building model="/assets/models/planter.glb" position={[2.8, 0, 9]} scale={2.5} rotationY={-Math.PI / 2} />
      <Building model="/assets/models/tree-large.glb" position={[-4, 0, 10]} scale={3} />
      <Building model="/assets/models/tree-small.glb" position={[4.5, 0, 13]} scale={3} />
    </group>
  )
}
