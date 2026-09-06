import Building from './Building'

/** PRD v2 §4.3 — "make it a proper city entrance": a kitbashed welcome
 * arch/gate straddling the road at the Plaza (the road's center, still the
 * bridge crossing point), flanked by lamps and planters. Replaces v1's bare
 * bridge tiles as the first and last thing every visit touches. */
// Positioned just before the bridge on the Foundry-side bank (not on the
// bridge deck itself, x=-6..6) so the gate stands clearly on solid ground
// rather than potentially overlapping the deck's own railing geometry.
const GATE_X = -9

export default function Plaza() {
  return (
    <group>
      <Building model="/assets/models/plaza-gate.glb" position={[GATE_X, 0, 0]} scale={1} />

      {/* Planters at the gate's column bases */}
      <Building model="/assets/models/planter.glb" position={[GATE_X + 0.8, 0, -2.8]} scale={2.5} />
      <Building model="/assets/models/planter.glb" position={[GATE_X - 0.8, 0, 2.8]} scale={2.5} rotationY={Math.PI} />

      {/* Streetlamps flanking both bridge approaches */}
      <Building model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, -3]} scale={2.5} />
      <Building model="/assets/models/streetlamp.glb" position={[GATE_X - 2, 0, 3]} scale={2.5} rotationY={Math.PI} />
      <Building model="/assets/models/streetlamp.glb" position={[8, 0, -3]} scale={2.5} />
      <Building model="/assets/models/streetlamp.glb" position={[8, 0, 3]} scale={2.5} rotationY={Math.PI} />
    </group>
  )
}
