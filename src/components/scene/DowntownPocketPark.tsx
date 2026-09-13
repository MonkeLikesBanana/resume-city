import Building from './Building'
import Bench from './Bench'
import TrashCan from './TrashCan'
import { PALETTE } from '../../config'

/** PRD v6.0 §1 — "there is still a large amount of open space" specifically
 * meant downtown's back edge: foundry-blocks.ts's filler rows stop at
 * z=±47, Ground.tsx's DOWNTOWN_GROUND paving reaches to z=±56, and
 * Forest.tsx's regions don't start until z<=-54/z>=54 — a real, ~7-unit-deep
 * strip of bare paved nothing the whole length of downtown, on both sides.
 * A real city puts *something* in a leftover strip like that — small green
 * space, a bench, street trees — rather than leaving it as unused pavement.
 * A patch of moss (matching the suburb's grass tone, not downtown's own
 * pavement, so it actually reads as a deliberate green break) plus street
 * trees and a couple of benches, not a full park (there's already a real
 * one in Park.tsx) — this is meant to feel incidental, the way a
 * downtown pocket park between two blocks usually is.
 *
 * X_RANGE kept west of -45: blocks.ts's WEDGE_EXCLUSION_ZONE (x:[-42,-13],
 * z:[8,50]) and Forest.tsx's own far wedge region (x:[-92,-46], z:[54,100])
 * both sit close to this strip's z-band — checked both against this park's
 * actual bounds rather than assumed clear, since that exact kind of
 * unchecked overlap is what caused the z-fighting bug fixed in PRD v5.0. */
const CENTER_Z = 50.5
const X_RANGE: [number, number] = [-80, -45]

export default function DowntownPocketPark() {
  const [x0, x1] = X_RANGE
  const width = x1 - x0
  const cx = (x0 + x1) / 2
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.026, CENTER_Z]} receiveShadow>
        <planeGeometry args={[width, 6]} />
        <meshStandardMaterial color={PALETTE.moss} roughness={1} />
      </mesh>

      <Building model="/assets/models/tree-large.glb" position={[x0 + 6, 0, CENTER_Z - 1]} scale={3.2} rotationY={0.4} />
      <Building model="/assets/models/tree-small.glb" position={[x0 + 16, 0, CENTER_Z + 1.5]} scale={3} rotationY={1.5} />
      <Building model="/assets/models/tree-large.glb" position={[cx + 4, 0, CENTER_Z - 1.5]} scale={3} rotationY={2.2} />
      <Building model="/assets/models/tree-small.glb" position={[x1 - 10, 0, CENTER_Z + 1]} scale={3.4} rotationY={0.8} />
      <Building model="/assets/models/flower-red.glb" position={[cx - 8, 0, CENTER_Z]} scale={2.5} />
      <Building model="/assets/models/flower-yellow.glb" position={[cx - 7, 0, CENTER_Z + 0.6]} scale={2.5} />

      <Bench position={[x0 + 11, 0, CENTER_Z]} rotationY={Math.PI / 2} />
      <Bench position={[x1 - 16, 0, CENTER_Z]} rotationY={-Math.PI / 2} />
      <TrashCan position={[cx, 0, CENTER_Z - 2]} />
    </group>
  )
}
