import { ATTRACTIONS } from '../../content/attractions'
import Hotspot from './Hotspot'
import Building from './Building'

const TREE_MODELS = ['/assets/models/tree-pine-a.glb', '/assets/models/tree-pine-b.glb', '/assets/models/tree-pine-tall.glb']

/** Scatter of decorative pine trees around the two districts — not
 * attractions, just Pacific-NW set dressing (PRD §4). Positions are
 * hand-picked to sit near, not on top of, the hotspots in attractions.ts. */
const TREE_PLACEMENTS: Array<[number, number, number]> = [
  [-10, 0, -14],
  [-20, 0, -16],
  [-30, 0, -12],
  [-38, 0, 4],
  [-20, 0, 20],
  [-10, 0, 20],
  [10, 0, -14],
  [20, 0, -12],
  [32, 0, -8],
  [38, 0, 8],
  [22, 0, 18],
  [10, 0, 22],
]

export default function City() {
  return (
    <group>
      {ATTRACTIONS.map((attraction) => (
        <Hotspot key={attraction.id} attraction={attraction} />
      ))}
      {TREE_PLACEMENTS.map((pos, i) => (
        <Building key={i} model={TREE_MODELS[i % TREE_MODELS.length]} position={pos} scale={5.5} rotationY={i * 0.7} />
      ))}
    </group>
  )
}
