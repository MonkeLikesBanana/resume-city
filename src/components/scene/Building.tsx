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
  /** PRD v4 §7.4 — opt into the night window-glow registry (src/lib/
   * windowGlow.ts). `<Building>` renders everything from actual attraction
   * buildings down to road signs and parasols, and most of those share
   * generic material names ("colormap") with real buildings — registering
   * unconditionally would give a traffic light or a planter the same warm
   * night glow as a building facade. Only the attraction-building call site
   * (Hotspot.tsx) sets this. */
  glowAtNight?: boolean
}

/** Loads and places one .glb model in world space. Uses drei's <Clone> —
 * not <primitive> — because the same source .glb (trees, props) is placed
 * many times, and a bare object3D can only live under one parent at once.
 * PRD §7.1/§9 — the dumb placement primitive; Phase 3 wraps this with the
 * clickable hotspot. */
export default function Building({ model, position, rotationY = 0, scale = 1, glowAtNight = false }: BuildingProps) {
  const { scene } = useGLTF(model)

  useEffect(() => {
    if (!glowAtNight) return
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) registerGlowMaterial(mesh.material as THREE.Material)
    })
  }, [scene, glowAtNight])

  return <Clone object={scene} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}

export function preloadBuilding(model: string) {
  useGLTF.preload(model)
}
