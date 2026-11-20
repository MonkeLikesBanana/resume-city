import Building from './Building'
import Bench from './Bench'
import TrashCan from './TrashCan'
import { PALETTE } from '../../config'

/** Keep the pocket park clear of the adjoining road and sidewalks to avoid overlapping surfaces. */
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
