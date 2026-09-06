import { ATTRACTIONS } from '../../content/attractions'
import Hotspot from './Hotspot'
import FillerBuildings from './FillerBuildings'
import RoadNetwork from './RoadNetwork'

// PRD v2 §4.2/§10 — the old ad-hoc dozen-tree scatter (v1) is retired here;
// Forest.tsx (Phase 10) replaces it with a real instanced forest belt.
export default function City() {
  return (
    <group>
      {ATTRACTIONS.map((attraction) => (
        <Hotspot key={attraction.id} attraction={attraction} />
      ))}
      <FillerBuildings />
      <RoadNetwork />
    </group>
  )
}
