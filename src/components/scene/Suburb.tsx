import { SUBURB_HOUSES } from '../../content/suburb-houses'
import InstancedBuildings from './InstancedBuildings'

/** PRD v3 §4.4/§9/§10 — purely decorative Lakeside density, mirroring
 * FillerBuildings.tsx exactly (§10's "never a hotspot, never in
 * AccessibleNav" rule applies identically here). */
export default function Suburb() {
  return <InstancedBuildings buildings={SUBURB_HOUSES} />
}
