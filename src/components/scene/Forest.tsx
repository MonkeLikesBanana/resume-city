import { useMemo } from 'react'
import { Instances, Instance, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Mix conifers and deciduous trees for varied silhouettes along the forest edge.
const TREE_MODELS = [
  '/assets/models/tree-pine-a.glb',
  '/assets/models/tree-pine-b.glb',
  '/assets/models/tree-pine-tall.glb',
  '/assets/models/tree-pine-round-d.glb',
  '/assets/models/tree-pine-small.glb',
  '/assets/models/tree-pine-tall-b.glb',
  '/assets/models/tree-oak.glb',
]

interface Rect {
  x: [number, number]
  z: [number, number]
  count: number
}
// Keep the forest outside the building and landmark footprints.
const REGIONS: Rect[] = [
  { x: [-175, -92], z: [-90, 100], count: 140 }, // west of Foundry's far end
  { x: [-92, 50], z: [-90, -54], count: 140 }, // south of Foundry (filler reaches z=-47)
  { x: [50, 120], z: [-90, 100], count: 140 }, // east of the Plaza square (reaches x=36) and Lakeside (reaches x=37)
  { x: [-92, -46], z: [54, 100], count: 100 }, // north of Foundry (reaches z=47), west of the Lakeside corridor/court (reaches x=-37) — clear of River.tsx's segments (max x=-30.5, all at z<=48)
  { x: [-40, 50], z: [98, 140], count: 100 }, // beyond the Lakeside cul-de-sac (z=93)
]

// Concentrate extra trees at the outer edge visible against the foothills.
const OUTER_TREELINE_COUNT = 300
const OUTER_TREELINE_RADIUS: [number, number] = [95, 138]

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

/** A polar annulus scatter for OUTER_TREELINE — see the constant's comment. */
function scatterRing(count: number, radiusRange: [number, number], rand: () => number): Placement[] {
  const placements: Placement[] = []
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2
    const radius = radiusRange[0] + rand() * (radiusRange[1] - radiusRange[0])
    placements.push({
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      rotationY: rand() * Math.PI * 2,
      scale: 4.5 + rand() * 3.5,
    })
  }
  return placements
}

/** Instance each submesh separately so multi-part tree models retain both trunks and foliage. */
function TreeInstances({ model, placements }: { model: string; placements: Placement[] }) {
  const { scene } = useGLTF(model)
  const meshes = useMemo<THREE.Mesh[]>(() => {
    const found: THREE.Mesh[] = []
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) found.push(child as THREE.Mesh)
    })
    return found
  }, [scene])

  if (meshes.length === 0) return null
  return (
    <group>
      {meshes.map((mesh, mi) => (
        <Instances key={mi} geometry={mesh.geometry} material={mesh.material} castShadow receiveShadow>
          {placements.map((p, i) => (
            <Instance key={i} position={p.position} rotation={[0, p.rotationY, 0]} scale={p.scale} />
          ))}
        </Instances>
      ))}
    </group>
  )
}

export default function Forest() {
  const placementsByModel = useMemo(() => {
    const rand = mulberry32(20260906)
    const all = [...REGIONS.flatMap((region) => scatterRegion(region, rand)), ...scatterRing(OUTER_TREELINE_COUNT, OUTER_TREELINE_RADIUS, rand)]
    const byModel: Placement[][] = TREE_MODELS.map(() => [])
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
