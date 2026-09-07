import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import Building from './Building'
import StreetLamp from './StreetLamp'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'
import { PALETTE } from '../../config'

const TILE = 3 // road tiles are 1x1 native, scale 3 -> 3x3m

// PRD v3 §4.1/§4.4/§7.1, extended by PRD v4 §4.2/§4.3 — the VISUAL road
// network: Main Street + Lakeside street (a plain asphalt plane plus a
// hand-added dashed centerline — see roadSurfaces()/centerlineDashes()
// below for why those are separate geometry rather than a kit road tile),
// the junction bend, driveways at every house, plus (new in v4) sidewalk
// paving strips
// between the road and each filler row, more streetlamps at regular
// intervals, street signs at cross-street intersections, dumpsters tucked
// behind the back filler row, and awning/parasol clusters on a few
// storefronts — filling the ground that was previously bare between the
// road and the buildings (PRD v4 §2's "no empty space" goal). The car only
// ever *drives* the graph in src/lib/roadGraph.ts (§7.5's scope
// simplification, unchanged) — all of this is set dressing.
const FOUNDRY_SPAN: [number, number] = [-90, -1.5]
const LAKESIDE_SPAN: [number, number] = [1.5, 88.5]
const CROSS_STREETS_X = [-26, -46]
const CROSS_STREET_Z_SPAN: [number, number] = [-31, 31]
const JUNCTION_ROTATION = 0
const POLE_INTERVAL = 24
const LAMP_INTERVAL = 16

function tilePositions(span: [number, number], axis: 'x' | 'z', fixed: number): Array<[number, number, number]> {
  const [from, to] = span
  const count = Math.round((to - from) / TILE)
  const positions: Array<[number, number, number]> = []
  for (let i = 0; i < count; i++) {
    const t = from + TILE / 2 + i * TILE
    positions.push(axis === 'x' ? [t, 0, fixed] : [fixed, 0, t])
  }
  return positions
}

const ROAD_WIDTH = 6

/** PRD v4 polish round 4 — the actual travel-lane surface of Main Street and
 * the Lakeside street: one continuous flat plane per street, not many tiled
 * road-side.glb/road-straight.glb copies. See centerlineDashes() below for
 * why the kit tiles were dropped for this — same reasoning, same fix. Meets
 * road-bend-sidewalk.glb (the junction) flush at each span's inner edge, the
 * same boundary the old tiled version used. */
function roadSurfaces() {
  const spans: Array<{ span: [number, number]; axis: 'x' | 'z' }> = [
    { span: FOUNDRY_SPAN, axis: 'x' },
    { span: LAKESIDE_SPAN, axis: 'z' },
  ]
  return spans.map(({ span, axis }, i) => {
    const center = (span[0] + span[1]) / 2
    const length = span[1] - span[0]
    const position: [number, number, number] = axis === 'x' ? [center, 0.01, 0] : [0, 0.01, center]
    const size: [number, number] = axis === 'x' ? [length, ROAD_WIDTH] : [ROAD_WIDTH, length]
    return (
      <mesh key={`road-surface-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color={PALETTE.asphalt} roughness={0.85} />
      </mesh>
    )
  })
}

/** A driveway connecting one Lakeside house to the street: perpendicular to
 * the street (which runs along Z), centered between the road edge and the
 * house's own lot. */
function driveways() {
  const houses = [...ATTRACTIONS.filter((a) => a.district === 'lakeside' && a.model), ...SUBURB_HOUSES.map((h) => ({ position: h.position }))]
  return houses.map((h, i) => {
    const [hx, , hz] = h.position
    const dx = hx > 0 ? 2.5 : -2.5 // halfway between the road edge and a ±9 lot
    return (
      <Building key={`driveway-${i}`} model="/assets/models/road-driveway-single.glb" position={[dx, 0, hz]} scale={TILE} rotationY={Math.PI / 2} />
    )
  })
}

function utilityPoles() {
  const positions: Array<[number, number, number]> = []
  for (let x = FOUNDRY_SPAN[0] + 6; x < -6; x += POLE_INTERVAL) positions.push([x, 0, 14])
  return positions.map((p, i) => (
    <group key={`pole-${i}`}>
      <Building model="/assets/models/electricity-pole.glb" position={p} scale={5} />
      <Building model="/assets/models/electricity-wires.glb" position={[p[0] + POLE_INTERVAL / 2, 0, p[2]]} scale={5} rotationY={Math.PI / 2} />
    </group>
  ))
}

/** PRD v4 §4.2 — regularly-spaced streetlamps along both Main Street and the
 * Lakeside street, alternating sides, in addition to the handful already
 * clustered at the Plaza (PlazaSquare.tsx). */
function streetlamps() {
  const lamps: Array<{ position: [number, number, number]; rotationY: number }> = []
  let side = 1
  for (let x = FOUNDRY_SPAN[0] + 8; x < -10; x += LAMP_INTERVAL, side *= -1) {
    lamps.push({ position: [x, 0, side * 3], rotationY: side > 0 ? 0 : Math.PI })
  }
  side = 1
  for (let z = LAKESIDE_SPAN[0] + 8; z < 82; z += LAMP_INTERVAL, side *= -1) {
    lamps.push({ position: [side * 3, 0, z], rotationY: side > 0 ? -Math.PI / 2 : Math.PI / 2 })
  }
  return lamps.map((l, i) => (
    <StreetLamp
      key={`lamp-${i}`}
      model="/assets/models/light-square.glb"
      position={l.position}
      scale={5}
      rotationY={l.rotationY}
      lampHeight={2.8}
      flickerSeed={(i * 0.37) % 1}
    />
  ))
}

/** PRD v4 §4.2 — paved sidewalk strips between the road and each filler
 * row, both districts. Plain planes, same technique/tone as PlazaSquare's
 * paving — the single biggest "this reads as a real street" fix, since bare
 * ground between a building's front door and the road is the most visible
 * empty-space gap in the whole downtown/suburb. */
function sidewalks() {
  const strips: Array<{ position: [number, number, number]; size: [number, number] }> = [
    { position: [(FOUNDRY_SPAN[0] - 12) / 2, 0.005, 7.5], size: [Math.abs(FOUNDRY_SPAN[0]) - 12, 11] },
    { position: [(FOUNDRY_SPAN[0] - 12) / 2, 0.005, -7.5], size: [Math.abs(FOUNDRY_SPAN[0]) - 12, 11] },
    { position: [7.5, 0.005, (LAKESIDE_SPAN[1] + 12) / 2], size: [11, LAKESIDE_SPAN[1] - 12] },
    { position: [-7.5, 0.005, (LAKESIDE_SPAN[1] + 12) / 2], size: [11, LAKESIDE_SPAN[1] - 12] },
  ]
  return strips.map((s, i) => (
    <mesh key={`sidewalk-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={s.position} receiveShadow>
      <planeGeometry args={s.size} />
      <meshStandardMaterial color={PALETTE.pavement} roughness={0.95} />
    </mesh>
  ))
}

const DASH_LENGTH = 1.4
const DASH_GAP = 1.6
const DASH_WIDTH = 0.22
const DASH_PERIOD = DASH_LENGTH + DASH_GAP
const DASH_MATERIAL_COLOR = '#dcd7c8'

/** PRD v4 polish round 4 — a painted dashed centerline down Main Street and
 * the Lakeside street. Not the road kit's own geometry: road-side.glb and
 * road-straight.glb turned out to share the exact same texture (a flat
 * color-swatch atlas, confirmed by extracting it directly), and tiling
 * either one repeatedly produced a busy alternating light/dark band across
 * the *whole* road width — not the plain asphalt-with-a-thin-centerline
 * look asked for. A dedicated thin plane per dash, the same "just add the
 * missing paint as its own flat geometry" technique sidewalks() already
 * uses, gives full control over exactly what the line looks like instead
 * of hoping a kit tile's built-in markings render the way its thumbnail
 * suggested. Skips a short gap around each cross-street intersection
 * (CROSS_STREETS_X) so a dash doesn't float on top of the crossroad tile.
 *
 * Rendered via drei's <Instances> (one geometry/material, ~55 <Instance>
 * children), not a plain <mesh> per dash — the first version did exactly
 * that and pushed mobile Lighthouse Total Blocking Time from ~110ms to
 * ~1100ms (confirmed by disabling it and re-measuring). Same root cause,
 * same fix as the mountain range and forest before it: many individually-
 * meshed objects cost real mount-time work under mobile's CPU throttle,
 * and the fix is always to instance, not to have less of it. */
function CenterlineDashes({ span, axis, fixed }: { span: [number, number]; axis: 'x' | 'z'; fixed: number }) {
  const positions = useMemo(() => {
    const [from, to] = span
    const count = Math.floor((to - from) / DASH_PERIOD)
    const result: Array<[number, number, number]> = []
    for (let i = 0; i < count; i++) {
      const center = from + DASH_PERIOD / 2 + i * DASH_PERIOD
      if (axis === 'x' && CROSS_STREETS_X.some((x) => Math.abs(x - center) < 2)) continue
      result.push(axis === 'x' ? [center, 0.015, fixed] : [fixed, 0.015, center])
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [span[0], span[1], axis, fixed])

  const size: [number, number] = axis === 'x' ? [DASH_LENGTH, DASH_WIDTH] : [DASH_WIDTH, DASH_LENGTH]
  const geometry = useMemo(() => new THREE.PlaneGeometry(size[0], size[1]), [size[0], size[1]])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: DASH_MATERIAL_COLOR, roughness: 0.7 }), [])

  return (
    <Instances geometry={geometry} material={material}>
      {positions.map((p, i) => (
        <Instance key={i} position={p} rotation={[-Math.PI / 2, 0, 0]} />
      ))}
    </Instances>
  )
}

/** PRD v4 §4.2 — dumpsters behind the back filler row, where a real alley
 * would have one; a couple of awning/parasol clusters on front-row
 * storefronts for variety. */
function alleyProps() {
  return (
    <>
      <Building model="/assets/models/dumpster.glb" position={[-30, 0, 33]} scale={4} rotationY={0.4} />
      <Building model="/assets/models/dumpster.glb" position={[-58, 0, -33]} scale={4} rotationY={-0.3} />
      <Building model="/assets/models/detail-parasol-a.glb" position={[-22, 0, 12.5]} scale={4.5} />
      <Building model="/assets/models/detail-parasol-b.glb" position={[-40, 0, -12.5]} scale={4.5} />
      <Building model="/assets/models/detail-awning.glb" position={[-64, 0, 13.5]} scale={5} />
    </>
  )
}

function crossStreetSigns() {
  return CROSS_STREETS_X.map((x) => (
    <group key={`sign-${x}`}>
      <Building model="/assets/models/road-sign-object-street.glb" position={[x - 1.5, 0, 4]} scale={6} />
      <Building model="/assets/models/road-sign-stop.glb" position={[x + 1.5, 0, -4]} scale={4} rotationY={Math.PI} />
    </group>
  ))
}

export default function RoadNetwork() {
  const crossStreetTiles = useMemo(
    () => CROSS_STREETS_X.flatMap((x) => tilePositions(CROSS_STREET_Z_SPAN, 'z', x).filter((p) => Math.abs(p[2]) > TILE / 2)),
    [],
  )

  return (
    <group>
      {roadSurfaces()}
      <Building model="/assets/models/road-bend-sidewalk.glb" position={[0, 0, 0]} scale={TILE} rotationY={JUNCTION_ROTATION} />
      <Building model="/assets/models/road-end-round.glb" position={[0, 0, 93]} scale={TILE} rotationY={Math.PI} />

      {crossStreetTiles.map((p, i) => (
        <Building key={`cross-${i}`} model="/assets/models/road-straight.glb" position={p} scale={TILE} />
      ))}
      {CROSS_STREETS_X.map((x) => (
        <Building key={`intersection-${x}`} model="/assets/models/road-crossroad.glb" position={[x, 0, 0]} scale={TILE} />
      ))}

      <Building model="/assets/models/traffic-light.glb" position={[-6, 0, -3]} scale={4} rotationY={Math.PI / 2} />
      <Building model="/assets/models/road-sign-street.glb" position={[6, 0, -3]} scale={4} rotationY={-Math.PI / 2} />

      <CenterlineDashes span={[FOUNDRY_SPAN[0] + 2, -4]} axis="x" fixed={0} />
      <CenterlineDashes span={[4, LAKESIDE_SPAN[1] - 2]} axis="z" fixed={0} />
      {sidewalks()}
      {utilityPoles()}
      {streetlamps()}
      {crossStreetSigns()}
      {alleyProps()}
      {driveways()}
    </group>
  )
}
