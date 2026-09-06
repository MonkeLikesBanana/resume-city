import { useMemo } from 'react'
import { Instances, Instance, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TREE_MODELS = ['/assets/models/tree-pine-a.glb', '/assets/models/tree-pine-b.glb', '/assets/models/tree-pine-tall.glb']

// PRD v3 §4.2 — the world is now an L-shape (Foundry west, Lakeside south)
// plus the Plaza's open square, not a symmetric east-west corridor, so the
// forest is five rectangular regions wrapping the outside of that shape
// (west of Foundry, south of Foundry, east of the Plaza/Lakeside, a wedge
// north of Foundry/west of Lakeside, and one beyond the Lakeside
// cul-de-sac) rather than two simple bands either side of one road. Each
// region is clear of every building/park/court region by construction — see
// the margins noted per region below. Must be GPU-instanced (drei
// <Instances>) — comparable total tree count to v2 (~300), just reshaped.
interface Rect {
  x: [number, number]
  z: [number, number]
  count: number
}
const REGIONS: Rect[] = [
  { x: [-175, -92], z: [-90, 100], count: 70 }, // west of Foundry's far end
  { x: [-92, 50], z: [-90, -40], count: 70 }, // south of Foundry (filler reaches z=-31)
  { x: [50, 120], z: [-90, 100], count: 70 }, // east of the Plaza square (reaches x=36) and Lakeside (reaches x=23)
  { x: [-92, -40], z: [35, 100], count: 50 }, // wedge: north of Foundry, west of the Lakeside corridor/court
  { x: [-40, 50], z: [98, 140], count: 50 }, // beyond the Lakeside cul-de-sac (z=93)
]

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

function scatterRegion(region: Rect, rand: () => number): Placement[] {
  const placements: Placement[] = []
  for (let i = 0; i < region.count; i++) {
    const x = region.x[0] + rand() * (region.x[1] - region.x[0])
    const z = region.z[0] + rand() * (region.z[1] - region.z[0])
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
    const all = REGIONS.flatMap((region) => scatterRegion(region, rand))
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
