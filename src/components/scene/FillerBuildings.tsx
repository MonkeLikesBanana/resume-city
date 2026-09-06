import { FOUNDRY_BLOCKS } from '../../content/foundry-blocks'
import InstancedBuildings from './InstancedBuildings'

/** PRD v3 §4.1/§9/§10 — purely decorative downtown density. No hotspot
 * marker, no click handler, not wired into AccessibleNav (§10) — a filler
 * building that somehow became reachable/announced would be a bug. */
export default function FillerBuildings() {
  return <InstancedBuildings buildings={FOUNDRY_BLOCKS} />
}
