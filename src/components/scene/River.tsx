import Building from './Building'
import { PALETTE } from '../../config'

// PRD v7.0 — replaces the wedge Forest region that used to sit between
// Lakeside and the Foundry district (Forest.tsx's old REGIONS entry at
// x:[-42,-13], z:[8,50], matching blocks.ts's WEDGE_EXCLUSION_ZONE): a
// forest directly between two built-up districts doesn't read as
// realistic, a river does. Built as a chain of overlapping circles (the
// same technique Park.tsx's pond already uses, just repeated and drifted)
// rather than a single rectangle — a river should meander, and overlapping
// circles guarantee no gaps without needing a custom path/spline mesh.
//
// Every segment is kept inside a conservative band (x roughly -41..-30)
// checked against everything else that can reach this quadrant: NEEMO HQ
// (attractions.ts, position [-26,0,9]) sits well east of it, the x=-26
// cross street's road bed (CROSS_STREET_WIDTH=5, centered -26 in
// RoadNetwork.tsx) stays clear by 2m+ at every segment, and
// DowntownPocketPark's X_RANGE ([-80,-45]) stays clear by 3.5m+ on the west
// side — computed from each segment's actual center+radius, not assumed.
const SEGMENTS: Array<{ x: number; z: number; r: number }> = [
  { x: -35, z: 10, r: 4.5 },
  { x: -36, z: 18, r: 4.5 },
  { x: -37, z: 26, r: 4.5 },
  { x: -36.5, z: 34, r: 4.5 },
  { x: -35.5, z: 42, r: 4.5 },
  { x: -35, z: 48, r: 4.5 },
]
const WATER_Y = 0.02 // matches Park.tsx's pond height

function WaterSegments() {
  return (
    <>
      {SEGMENTS.map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[s.x, WATER_Y, s.z]}>
          <circleGeometry args={[s.r, 24]} />
          <meshStandardMaterial color={PALETTE.lake} transparent opacity={0.88} roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
    </>
  )
}

/** A little bank dressing so the river reads as a real feature rather than
 * a flat blue shape dropped into a gap — a few rocks/reeds close to the
 * water's edge, and a couple of pines further back blending into the
 * forest belt on either side, echoing Park.tsx's own pond treatment. */
function BankDecor() {
  return (
    <>
      <Building model="/assets/models/rock-small-a.glb" position={[-31, 0, 14]} scale={2.6} rotationY={0.6} />
      <Building model="/assets/models/rock-small-b.glb" position={[-40.5, 0, 24]} scale={2.4} rotationY={1.4} />
      <Building model="/assets/models/rock-small-a.glb" position={[-32, 0, 38]} scale={2.2} rotationY={2.2} />
      <Building model="/assets/models/flower-purple.glb" position={[-30.5, 0, 20]} scale={2.2} />
      <Building model="/assets/models/flower-yellow.glb" position={[-41, 0, 32]} scale={2.2} />
      <Building model="/assets/models/tree-pine-small.glb" position={[-29, 0, 16]} scale={4.2} rotationY={0.3} />
      <Building model="/assets/models/tree-pine-a.glb" position={[-42, 0, 28]} scale={4.6} rotationY={1.1} />
      <Building model="/assets/models/tree-pine-round-d.glb" position={[-28.5, 0, 44]} scale={4} rotationY={2.4} />
    </>
  )
}

export default function River() {
  return (
    <group>
      <WaterSegments />
      <BankDecor />
    </group>
  )
}
