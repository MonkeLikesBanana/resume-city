import { FILLER_BUILDINGS } from '../../content/filler-buildings'
import Building from './Building'

/** PRD v2 §4.1/§9/§10 — purely decorative downtown density. Deliberately has
 * NO hotspot marker, NO click handler, and is NOT wired into AccessibleNav —
 * a filler building that somehow became reachable/announced would be a bug,
 * not a feature (PRD §10). */
export default function FillerBuildings() {
  return (
    <group>
      {FILLER_BUILDINGS.map((f, i) => (
        <Building key={i} model={f.model} position={f.position} rotationY={f.rotationY} scale={f.scale} />
      ))}
    </group>
  )
}
