import { useMemo } from 'react'
import { Instances, Instance, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TREE_MODELS = ['/assets/models/tree-pine-a.glb', '/assets/models/tree-pine-b.glb', '/assets/models/tree-pine-tall.glb']

// PRD v2 §4.2/§12 — "forest across the sides of the area" so the world reads
// as full from car-eye height, not just from directly overhead. Two dense
// bands flanking the whole Main Street corridor, north and south, well
// beyond the downtown block depth (filler buildings reach z=±23) and inside
// the distant mountain ring (radius 150). Must be GPU-instanced (drei
// <Instances>) — this is 150-300 trees, not the dozen v1 had.
const BAND_X: [number, number] = [-88, 78]
const NORTH_BAND_Z: [number, number] = [28, 72]
const SOUTH_BAND_Z: [number, number] = [-72, -28]
const TREES_PER_BAND = 90

interface Placement {
  position: [number, number, number]
  rotationY: number
  scale: number
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function scatterBand(zRange: [number, number], rand: () => number): Placement[] {
  const placements: Placement[] = []
  for (let i = 0; i < TREES_PER_BAND; i++) {
    const x = BAND_X[0] + rand() * (BAND_X[1] - BAND_X[0])
    const z = zRange[0] + rand() * (zRange[1] - zRange[0])
    placements.push({
      position: [x, 0, z],
      rotationY: rand() * Math.PI * 2,
      scale: 4.5 + rand() * 3.5,
    })
  }
  return placements
}

function TreeInstances({ model, placements }: { model: string; placements: Placement[] }) {
  const { scene } = useGLTF(model)
  const mesh = useMemo<THREE.Mesh | null>(() => {
    let found: THREE.Mesh | null = null
    scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh) found = child as THREE.Mesh
    })
    return found
  }, [scene])

  if (!mesh) return null
  return (
    <Instances geometry={mesh.geometry} material={mesh.material} castShadow receiveShadow>
      {placements.map((p, i) => (
        <Instance key={i} position={p.position} rotation={[0, p.rotationY, 0]} scale={p.scale} />
      ))}
    </Instances>
  )
}

export default function Forest() {
  const placementsByModel = useMemo(() => {
    const rand = mulberry32(20260906)
    const all = [...scatterBand(NORTH_BAND_Z, rand), ...scatterBand(SOUTH_BAND_Z, rand)]
    const byModel: Placement[][] = [[], [], []]
    all.forEach((p, i) => byModel[i % TREE_MODELS.length].push(p))
    return byModel
  }, [])

  return (
    <group>
      {TREE_MODELS.map((model, i) => (
        <TreeInstances key={model} model={model} placements={placementsByModel[i]} />
      ))}
    </group>
  )
}
