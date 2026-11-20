import { ATTRACTIONS } from '../../content/attractions'
import Building from './Building'
import FillerBuildings from './FillerBuildings'
import RoadNetwork from './RoadNetwork'

export default function City() {
  return (
    <group>
      {ATTRACTIONS.map(({ id, model, position, rotationY, scale }) => model && (
        <Building key={id} model={model} position={position} rotationY={rotationY} scale={scale} />
      ))}
      <FillerBuildings />
      <RoadNetwork />
    </group>
  )
}
