import Building from './Building'
import StreetLamp from './StreetLamp'
import { PALETTE } from '../../config'

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
          ground — PALETTE.pavement, the same stone tone RoadNetwork.tsx's
          sidewalks use, not PALETTE.ground (that's the exact same color as
          the base ground plane and would be invisible). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.01, SQUARE_CENTER[1]]} receiveShadow>
        <planeGeometry args={SQUARE_SIZE} />
        <meshStandardMaterial color={PALETTE.pavement} roughness={0.95} />
      </mesh>

      {/* Foundry gateway — the existing arch, spanning Main Street (unchanged
          local orientation: columns flank a road running along X) */}
      <Building model="/assets/models/plaza-gate.glb" position={[GATE_X, 0, 0]} scale={1} />
      <Building model="/assets/models/planter.glb" position={[GATE_X + 0.8, 0, -2.8]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[GATE_X - 0.8, 0, 2.8]} scale={2.5} rotationY={Math.PI} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, -3]} scale={2.5} lampHeight={1.6} flickerSeed={0.1} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, 3]} scale={2.5} rotationY={Math.PI} lampHeight={1.6} flickerSeed={0.4} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[-1.5, 0, -3]} scale={2.5} lampHeight={1.6} flickerSeed={0.7} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[-1.5, 0, 3]} scale={2.5} rotationY={Math.PI} lampHeight={1.6} flickerSeed={0.9} />

      {/* Lakeside transition — flanking trees/planters, no monument (§4.3) */}
      <Building model="/assets/models/planter.glb" position={[-2.8, 0, 7]} scale={2.5} rotationY={Math.PI / 2} />
      <Building model="/assets/models/planter.glb" position={[2.8, 0, 9]} scale={2.5} rotationY={-Math.PI / 2} />
      <Building model="/assets/models/tree-large.glb" position={[-4, 0, 10]} scale={3} />
      <Building model="/assets/models/tree-small.glb" position={[4.5, 0, 13]} scale={3} />

      {/* PRD v4 §4.1 — more decoration: a paved medallion in the square
          floor, a second streetlamp style at the outer corners, café-seating
          parasol clusters, and more planters/trees so the square doesn't
          read as a mostly-bare rectangle with a gate in it. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.015, SQUARE_CENTER[1]]}>
        <ringGeometry args={[6, 6.6, 48]} />
        <meshStandardMaterial color="#9d9689" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.015, SQUARE_CENTER[1]]}>
        <ringGeometry args={[3.2, 3.6, 40]} />
        <meshStandardMaterial color="#9d9689" roughness={0.9} />
      </mesh>

      <StreetLamp model="/assets/models/light-square-double.glb" position={[32, 0, -32]} scale={5} rotationY={Math.PI * 1.25} lampHeight={2.8} flickerSeed={0.3} />
      <StreetLamp model="/assets/models/light-square-double.glb" position={[32, 0, 2]} scale={5} rotationY={-Math.PI * 0.25} lampHeight={2.8} flickerSeed={0.6} />

      <Building model="/assets/models/detail-parasol-a.glb" position={[24, 0, -24]} scale={5} />
      <Building model="/assets/models/detail-parasol-b.glb" position={[27, 0, -21]} scale={5} rotationY={1.1} />
      <Building model="/assets/models/detail-parasol-a.glb" position={[9, 0, -25]} scale={5} rotationY={2.4} />

      <Building model="/assets/models/planter.glb" position={[34, 0, -34]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[34, 0, -2]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[2, 0, -34]} scale={2.5} />
      <Building model="/assets/models/tree-large.glb" position={[30, 0, -6]} scale={3.4} rotationY={0.6} />
      <Building model="/assets/models/tree-small.glb" position={[6, 0, -30]} scale={3.2} rotationY={1.8} />
    </group>
  )
}
