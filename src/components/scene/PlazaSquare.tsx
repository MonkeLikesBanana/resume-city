import Building from './Building'
import Bench from './Bench'
import TrashCan from './TrashCan'
import { PALETTE } from '../../config'

/** Keep the Plaza open around the junction so the home camera can see both districts. */
// Keep the square and the home road spur sized together so the camera parks within the Plaza.
const SQUARE_SIZE: [number, number] = [20, 20]
const SQUARE_CENTER: [number, number] = [10, -10] // +X,-Z quadrant

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
      {/* Use the square lamp model at the gate so visible fixture geometry stays clear of the road. */}
      <Building model="/assets/models/light-square.glb" position={[GATE_X - 2, 0, -3]} scale={5} />
      <Building model="/assets/models/light-square.glb" position={[GATE_X - 2, 0, 3]} scale={5} rotationY={Math.PI} />
      <Building model="/assets/models/light-square.glb" position={[-1.5, 0, -3]} scale={5} />
      <Building model="/assets/models/light-square.glb" position={[-1.5, 0, 3]} scale={5} rotationY={Math.PI} />

      {/* Flank the Lakeside entrance with trees and planters. */}
      <Building model="/assets/models/planter.glb" position={[-2.8, 0, 7]} scale={2.5} rotationY={Math.PI / 2} />
      <Building model="/assets/models/planter.glb" position={[2.8, 0, 9]} scale={2.5} rotationY={-Math.PI / 2} />
      <Building model="/assets/models/tree-large.glb" position={[-4, 0, 10]} scale={3} />
      <Building model="/assets/models/tree-small.glb" position={[4.5, 0, 13]} scale={3} />

      {/* Center the paving detail within the open square. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.015, SQUARE_CENTER[1]]}>
        <ringGeometry args={[3.0, 3.3, 48]} />
        <meshStandardMaterial color="#9d9689" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.015, SQUARE_CENTER[1]]}>
        <ringGeometry args={[1.6, 1.8, 40]} />
        <meshStandardMaterial color="#9d9689" roughness={0.9} />
      </mesh>

      <Building model="/assets/models/light-square-double.glb" position={[18, 0, -18]} scale={5} rotationY={Math.PI * 1.25} />

      <Building model="/assets/models/detail-parasol-a.glb" position={[5, 0, -16]} scale={5} />
      <Building model="/assets/models/detail-parasol-b.glb" position={[17, 0, -4]} scale={5} rotationY={1.1} />

      <Building model="/assets/models/planter.glb" position={[2, 0, -18]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[18, 0, -2]} scale={2.5} />
      <Building model="/assets/models/tree-large.glb" position={[16, 0, -6]} scale={3.4} rotationY={0.6} />
      <Building model="/assets/models/tree-small.glb" position={[3, 0, -12]} scale={3.2} rotationY={1.8} />

      {/* Anchor the seating on paved pads so it reads as part of the square. */}
      <Bench position={[SQUARE_CENTER[0] - 5, 0, SQUARE_CENTER[1]]} rotationY={-Math.PI / 2} />
      <Bench position={[SQUARE_CENTER[0], 0, SQUARE_CENTER[1] - 5]} rotationY={0} />
      <TrashCan position={[SQUARE_CENTER[0] - 4, 0, SQUARE_CENTER[1] - 4]} />
    </group>
  )
}
