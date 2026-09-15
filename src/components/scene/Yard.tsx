import { useMemo } from 'react'
import { Instances, Instance, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from '../../config'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'

// PRD v7.0 — a real front yard per suburb house: a lawn patch plus a
// low picket fence on three sides (the two flanks and the street-facing
// edge, with a gate gap in the middle of the street edge; the house's own
// wall closes off the fourth side, so no panel is needed there). This is
// the actual fix for "suburb ground still gray, not green" — round 5's
// coarse GRASS_SIZE rectangle covers the suburb's footprint in theory, but
// Ground.tsx's separate DOWNTOWN_GROUND pavement rectangle (sized for
// Foundry's own filler) reaches far enough east that it overlaps the
// suburb's west-row houses for their outer stretch (z > ~50) at a higher Y
// than the grass, so pavement wins there instead of moss (see Ground.tsx's
// own DOWNTOWN_GROUND_SIZE comment for the exact overlap math). Rather than
// keep tuning two coarse rectangles against each other, every house gets
// its own lawn plane rendered *above* both coarse rectangles — it can't
// lose to an unrelated district's pavement regardless of where either
// district's footprint grows next.
const YARD_DEPTH = 5 // meters, from the house out toward the street
const YARD_WIDTH = 6 // meters, along the street
const LAWN_Y = 0.006 // between sidewalks() (0.005) and Driveways() (0.008) — a yard's lawn crosses neither, it sits between the house and the driveway strip, but still needs a height distinct from both since its bounds are close to each
// PRD v7.0 round 5 — was '/assets/models/fence-low.glb', found broken during
// self-review: screenshotting the actual in-game fences showed panels
// floating above the ground at odd tilted angles, not sitting flat. Isolated
// fence-low.glb alone in a debug page (identity rotation, flat grid, no game
// code involved) and confirmed it directly — the mesh itself is modeled as a
// leaning/knocked-over fence variant (the "low" refers to a fallen-down
// state, not a short-but-upright fence), not a placement bug in this file.
// fence.glb (internal mesh name "fence-1x2") is a normal flat straight panel
// with integrated end/center posts, confirmed via the same isolated-render
// technique — a top-down orthographic shot showed a clean straight run along
// its local X axis, sitting flat on the ground plane.
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

  // The five real Lakeside attractions that are actual houses (cafe, arcade,
  // sports-field, open-road — `coming-soon` has no model, it's meant to
  // read as a bare undeveloped lot) get the same yard treatment as the
  // generated filler houses — without this, "The Open Road"/"Sports Field"
  // still showed bare ground right around the building itself even after
  // the filler houses on either side had fenced lawns (confirmed via
  // screenshot: the named attraction in the middle of the frame was the
  // one visibly bare spot).
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
