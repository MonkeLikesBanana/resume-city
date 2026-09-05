import { Clone, useGLTF } from '@react-three/drei'
import type { Vec3 } from '../../types/attraction'

interface BuildingProps {
  model: string
  position: Vec3
  rotationY?: number
  scale?: number
}

/** Loads and places one .glb model in world space. Uses drei's <Clone> —
 * not <primitive> — because the same source .glb (trees, props) is placed
 * many times, and a bare object3D can only live under one parent at once.
 * PRD §7.1/§9 — the dumb placement primitive; Phase 3 wraps this with the
 * clickable hotspot. */
export default function Building({ model, position, rotationY = 0, scale = 1 }: BuildingProps) {
  const { scene } = useGLTF(model)
  return <Clone object={scene} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}

export function preloadBuilding(model: string) {
  useGLTF.preload(model)
}
