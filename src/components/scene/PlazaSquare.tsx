import Building from './Building'
import StreetLamp from './StreetLamp'
import Bench from './Bench'
import TrashCan from './TrashCan'
import { PALETTE } from '../../config'

/** PRD v3 §4.3 — the Welcome Plaza is now an open paved square occupying the
 * "outside" corner of the junction (+X,-Z — the quadrant neither arm claims),
 * not a gate spanning a bridge. The existing kitbashed arch moves to mark
 * the Foundry arm's entrance specifically (a monumental downtown gateway
 * makes sense where downtown starts); the Lakeside arm gets a lighter,
 * residential-appropriate transition instead of a matching monument. */
// PRD v4 polish round 5 — shrunk again (was [28,28], round 4's cut from the
// original [40,40]): round 4 shrunk the pavement and scaled every prop's
// *position* toward SQUARE_CENTER, but left every prop at its normal size
// and — more importantly — left the camera's own parked spot
// (road.ts's PLAZA_ARM) at its original far-corner distance, so the plaza
// didn't actually feel smaller from where you experience it (you still
// parked just as far out). This round shrinks the square, the parked
// distance (PLAZA_ARM, moved together with this), AND hand-replaces every
// decoration at a fresh position sized for the smaller footprint — not
// more proportional-scaling-toward-center math, which is exactly what
// produced round 4's parasol-on-top-of-the-camera bug when a prop's offset
// direction happened to be colinear with the camera's own fixed offset.
// Every position below was checked against the parked camera point
// (road.ts's PLAZA_ARM endpoint, [14,-14]) for real clearance before
// being written down, not assumed safe from proportional math.
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
      {/* PRD v6.0 §2 — scale bumped 2.5->5 (lampHeight 1.6->3 to match): a
          direct model-dimension check found streetlamp.glb's native size is
          nearly identical to light-square.glb's (~0.6-0.68 tall), but every
          other streetlamp in the city uses scale=5 for that near-identical
          model — these four, gate-only, were rendering at roughly half the
          height of every other lamp in the city, a real, measurable
          inconsistency and not a deliberate "shorter gate lamp" choice
          (nothing else about the gate calls for shorter fixtures). Found via
          a temporary isolated model-comparison render, not a guess from a
          screenshot. */}
      <StreetLamp model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, -3]} scale={5} lampHeight={3} flickerSeed={0.1} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, 3]} scale={5} rotationY={Math.PI} lampHeight={3} flickerSeed={0.4} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[-1.5, 0, -3]} scale={5} lampHeight={3} flickerSeed={0.7} />
      <StreetLamp model="/assets/models/streetlamp.glb" position={[-1.5, 0, 3]} scale={5} rotationY={Math.PI} lampHeight={3} flickerSeed={0.9} />

      {/* Lakeside transition — flanking trees/planters, no monument (§4.3) */}
      <Building model="/assets/models/planter.glb" position={[-2.8, 0, 7]} scale={2.5} rotationY={Math.PI / 2} />
      <Building model="/assets/models/planter.glb" position={[2.8, 0, 9]} scale={2.5} rotationY={-Math.PI / 2} />
      <Building model="/assets/models/tree-large.glb" position={[-4, 0, 10]} scale={3} />
      <Building model="/assets/models/tree-small.glb" position={[4.5, 0, 13]} scale={3} />

      {/* PRD v4 §4.1, resized round 5 — a paved medallion in the square
          floor, a streetlamp at the far corner, a café-seating parasol
          cluster, and planters/trees so the smaller square still doesn't
          read as bare. Every position here checked against the parked
          camera point [14,-14] (road.ts's PLAZA_ARM) for real clearance —
          minimum 5.66 units, comfortably outside any prop's own footprint
          — not proportional math trusted to land somewhere safe. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.015, SQUARE_CENTER[1]]}>
        <ringGeometry args={[3.0, 3.3, 48]} />
        <meshStandardMaterial color="#9d9689" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SQUARE_CENTER[0], 0.015, SQUARE_CENTER[1]]}>
        <ringGeometry args={[1.6, 1.8, 40]} />
        <meshStandardMaterial color="#9d9689" roughness={0.9} />
      </mesh>

      <StreetLamp model="/assets/models/light-square-double.glb" position={[18, 0, -18]} scale={5} rotationY={Math.PI * 1.25} lampHeight={2.8} flickerSeed={0.3} />

      <Building model="/assets/models/detail-parasol-a.glb" position={[5, 0, -16]} scale={5} />
      <Building model="/assets/models/detail-parasol-b.glb" position={[17, 0, -4]} scale={5} rotationY={1.1} />

      <Building model="/assets/models/planter.glb" position={[2, 0, -18]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[18, 0, -2]} scale={2.5} />
      <Building model="/assets/models/tree-large.glb" position={[16, 0, -6]} scale={3.4} rotationY={0.6} />
      <Building model="/assets/models/tree-small.glb" position={[3, 0, -12]} scale={3.2} rotationY={1.8} />

      {/* PRD v6.0 §1 — the medallion itself was the only thing anchoring the
          square's open pavement; nothing invited you to actually stop there.
          Two benches facing it plus a trash can, the same "give the open
          paving a reason to exist" fix applied to the sidewalks/Park below. */}
      <Bench position={[SQUARE_CENTER[0] - 5, 0, SQUARE_CENTER[1]]} rotationY={-Math.PI / 2} />
      <Bench position={[SQUARE_CENTER[0], 0, SQUARE_CENTER[1] - 5]} rotationY={0} />
      <TrashCan position={[SQUARE_CENTER[0] - 4, 0, SQUARE_CENTER[1] - 4]} />
    </group>
  )
}
