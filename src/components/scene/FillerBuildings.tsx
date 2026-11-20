import { FOUNDRY_BLOCKS } from '../../content/foundry-blocks'
import InstancedBuildings from './InstancedBuildings'

export default function FillerBuildings() {
  return <InstancedBuildings buildings={FOUNDRY_BLOCKS} />
}
