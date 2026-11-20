import { useLayoutEffect, useRef } from 'react'
import {
  Matrix4, MeshStandardMaterial, Quaternion, SphereGeometry, Vector3,
  type BufferGeometry, type InstancedMesh,
} from 'three'
import { ATTRACTIONS } from '../../content/attractions'
import type { ResumeEntryId } from '../../content/resume'
import useCityStore from '../../store/useCityStore'
import { INFILL, LAND, MODEL_PALETTE, PARCELS, PLINTH, SIGNATURES, TREES, TYPICAL_MASS, WATER } from './massing'

function matte(color: string) {
  return new MeshStandardMaterial({ color, roughness: 1, metalness: 0 })
}

const building = matte(MODEL_PALETTE.building)
const selected = matte(MODEL_PALETTE.selected)
const plinth = matte(MODEL_PALETTE.plinth)
const parcels = matte(MODEL_PALETTE.blocks)
const trees = matte(MODEL_PALETTE.trees)
const water = matte(MODEL_PALETTE.water)
const treeGeometry = new SphereGeometry(1, 12, 8)

const infill = INFILL.filter(({ position, scale }) => ATTRACTIONS.every(stop => {
  const bounds = SIGNATURES[stop.id as ResumeEntryId].boundingBox!
  const [x, , z] = stop.position
  return position.x + scale.x / 2 + .5 < x + bounds.min.x
    || position.x - scale.x / 2 - .5 > x + bounds.max.x
    || position.z + scale.z / 2 + .5 < z + bounds.min.z
    || position.z - scale.z / 2 - .5 > z + bounds.max.z
}))

function RepeatedMasses({ geometry, material, items }: {
  geometry: BufferGeometry
  material: MeshStandardMaterial
  items: { position: Vector3; scale: Vector3 }[]
}) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current!
    const matrix = new Matrix4()
    const rotation = new Quaternion()
    items.forEach(({ position, scale }, index) => mesh.setMatrixAt(index, matrix.compose(position, rotation, scale)))
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])

  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow receiveShadow />
}

export default function City() {
  const active = useCityStore(state => state.activeAttractionId)

  return (
    <group dispose={null}>
      <mesh geometry={PLINTH} material={plinth} position={[-25, -.84, -1]} castShadow receiveShadow />
      <mesh geometry={LAND} material={plinth} receiveShadow />
      <mesh geometry={PARCELS} material={parcels} position={[0, .035, 0]} receiveShadow />
      <mesh geometry={WATER} material={water} />
      <RepeatedMasses geometry={TYPICAL_MASS} material={building} items={infill} />
      <RepeatedMasses geometry={treeGeometry} material={trees} items={TREES} />
      {ATTRACTIONS.map(stop => (
        <mesh
          key={stop.id}
          geometry={SIGNATURES[stop.id as ResumeEntryId]}
          material={stop.id === active ? selected : building}
          position={[stop.position[0], .035, stop.position[2]]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
