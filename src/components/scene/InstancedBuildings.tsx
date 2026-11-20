import { useMemo } from 'react'
import { Instances, Instance, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { FillerBuilding } from '../../types/attraction'
function ModelInstances({ model, placements }: { model: string; placements: FillerBuilding[] }) {
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
        <Instance key={i} position={p.position} rotation={[0, p.rotationY ?? 0, 0]} scale={p.scale ?? 1} />
      ))}
    </Instances>
  )
}

export default function InstancedBuildings({ buildings }: { buildings: FillerBuilding[] }) {
  const byModel = useMemo(() => {
    const groups = new Map<string, FillerBuilding[]>()
    for (const b of buildings) {
      const group = groups.get(b.model)
      if (group) group.push(b)
      else groups.set(b.model, [b])
    }
    return groups
  }, [buildings])

  return (
    <group>
      {[...byModel.entries()].map(([model, placements]) => (
        <ModelInstances key={model} model={model} placements={placements} />
      ))}
    </group>
  )
}
