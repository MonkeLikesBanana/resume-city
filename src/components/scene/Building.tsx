import { Clone, useGLTF } from '@react-three/drei'
import type { Vec3 } from '../../types/attraction'

interface BuildingProps {
  model: string
  position: Vec3
  rotationY?: number
  scale?: number
}

export default function Building({ model, position, rotationY = 0, scale = 1 }: BuildingProps) {
  const { scene } = useGLTF(model)
  return <Clone object={scene} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}

export function preloadBuilding(model: string) {
  useGLTF.preload(model)
}
