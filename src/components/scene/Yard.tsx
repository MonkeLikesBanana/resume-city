import { useMemo } from 'react'
import { Instances, Instance, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from '../../config'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'

// Give each house a lawn above the shared ground so its yard stays green where ground patches overlap.
const YARD_DEPTH = 5 // meters, from the house out toward the street
const YARD_WIDTH = 6 // meters, along the street
const LAWN_Y = 0.006 // between sidewalks() (0.005) and Driveways() (0.008) — a yard's lawn crosses neither, it sits between the house and the driveway strip, but still needs a height distinct from both since its bounds are close to each
// Use fence segments aligned along local X so sections can rotate around the yard corners.
const FENCE_MODEL = '/assets/models/fence.glb'
const FENCE_SCALE = 1.4
const FENCE_PANEL_LENGTH = 0.876 * FENCE_SCALE // native bbox x-extent (the panel's long axis), measured directly from the glb
const GATE_GAP = 1.8 // meters left open in the middle of the street-facing edge

interface FencePanel {
  position: [number, number, number]
  rotationY: number
}

interface Lawn {
  center: [number, number, number]
  size: [number, number] // [x-extent, z-extent]
}

function fenceRun(fixed: number, fixedAxis: 'x' | 'z', from: number, to: number, rotationY: number): FencePanel[] {
  const length = Math.abs(to - from)
  const count = Math.max(1, Math.round(length / FENCE_PANEL_LENGTH))
  const step = length / count
  const dir = to >= from ? 1 : -1
  const panels: FencePanel[] = []
  for (let i = 0; i < count; i++) {
    const along = from + dir * step * (i + 0.5)
    panels.push({ position: fixedAxis === 'z' ? [along, 0, fixed] : [fixed, 0, along], rotationY })
  }
  return panels
}

function yardsAndFences() {
  const lawns: Lawn[] = []
  const panels: FencePanel[] = []

  // Lakeside stops share the yard treatment used by the surrounding houses.
  const houses = [...SUBURB_HOUSES, ...ATTRACTIONS.filter((a) => a.district === 'lakeside' && a.model).map((a) => ({ position: a.position }))]

  for (const house of houses) {
    const [hx, , hz] = house.position
    const side = hx > 0 ? -1 : 1 // toward the street, same convention as Suburb.tsx's yardGreeneryItems
    const houseEdgeX = hx
    const streetEdgeX = hx + side * YARD_DEPTH
    const xNear = Math.min(houseEdgeX, streetEdgeX)
    const xFar = Math.max(houseEdgeX, streetEdgeX)
    const zLo = hz - YARD_WIDTH / 2
    const zHi = hz + YARD_WIDTH / 2

    lawns.push({ center: [(houseEdgeX + streetEdgeX) / 2, LAWN_Y, hz], size: [YARD_DEPTH, YARD_WIDTH] })

    // Two long flanks, running the full depth from the house out to the street.
    panels.push(...fenceRun(zLo, 'z', xNear, xFar, 0))
    panels.push(...fenceRun(zHi, 'z', xNear, xFar, 0))

    // Street-facing edge, split around a gate gap in the middle.
    const gateHalf = GATE_GAP / 2
    panels.push(...fenceRun(streetEdgeX, 'x', zLo, hz - gateHalf, Math.PI / 2))
    panels.push(...fenceRun(streetEdgeX, 'x', hz + gateHalf, zHi, Math.PI / 2))
  }

  return { lawns, panels }
}

function LawnPatches({ lawns }: { lawns: Lawn[] }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: PALETTE.moss, roughness: 1 }), [])
  return (
    <Instances geometry={geometry} material={material} receiveShadow>
      {lawns.map((l, i) => (
        <Instance key={i} position={l.center} rotation={[-Math.PI / 2, 0, 0]} scale={[l.size[0], l.size[1], 1]} />
      ))}
    </Instances>
  )
}

function FencePanels({ panels }: { panels: FencePanel[] }) {
  const { scene } = useGLTF(FENCE_MODEL)
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
          {panels.map((p, i) => (
            <Instance key={i} position={p.position} rotation={[0, p.rotationY, 0]} scale={FENCE_SCALE} />
          ))}
        </Instances>
      ))}
    </group>
  )
}

export default function Yard() {
  const { lawns, panels } = useMemo(yardsAndFences, [])
  return (
    <group>
      <LawnPatches lawns={lawns} />
      <FencePanels panels={panels} />
    </group>
  )
}
