import { useEffect } from 'react'
import { Clone, useGLTF } from '@react-three/drei'
import type * as THREE from 'three'
import type { Vec3 } from '../../types/attraction'
import { registerGlowMaterial } from '../../lib/windowGlow'

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
 * clickable hotspot. PRD v4 §7.4 — also registers any real glass material
 * for the night window-glow system (src/lib/windowGlow.ts); a no-op for
 * models that don't have one. */
export default function Building({ model, position, rotationY = 0, scale = 1 }: BuildingProps) {
  const { scene } = useGLTF(model)

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) registerGlowMaterial(mesh.material as THREE.Material)
    })
  }, [scene])

  return <Clone object={scene} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}

export function preloadBuilding(model: string) {
  useGLTF.preload(model)
}
