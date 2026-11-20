import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import Building from './Building'
import Bench from './Bench'
import TrashCan from './TrashCan'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'
import { PALETTE } from '../../config'

const TILE = 3 // road tiles are 1x1 native, scale 3 -> 3x3m

// Decorative side streets fill the blocks while the camera follows only the three main road arms.
const FOUNDRY_SPAN: [number, number] = [-90, -1.5]
const LAKESIDE_SPAN: [number, number] = [1.5, 88.5]
const CROSS_STREETS_X = [-26, -46]
const CROSS_STREET_Z_SPAN: [number, number] = [-31, 31]
const POLE_INTERVAL = 24
const LAMP_INTERVAL = 16

const ROAD_WIDTH = 6
const CROSS_STREET_WIDTH = 5

interface StreetSpan {
  span: [number, number]
  axis: 'x' | 'z'
  width: number
  fixed: number
}

/** Keep the asphalt slightly above the adjoining paving so the junction layers render cleanly. */
const ROAD_Y = 0.012

function roadSurfaces() {
  const streets: StreetSpan[] = [
    { span: FOUNDRY_SPAN, axis: 'x', width: ROAD_WIDTH, fixed: 0 },
    { span: LAKESIDE_SPAN, axis: 'z', width: ROAD_WIDTH, fixed: 0 },
    ...CROSS_STREETS_X.map((x) => ({ span: CROSS_STREET_Z_SPAN, axis: 'z' as const, width: CROSS_STREET_WIDTH, fixed: x })),
  ]
  return (
    <>
      {streets.map((s, i) => {
        const center = (s.span[0] + s.span[1]) / 2
        const length = s.span[1] - s.span[0]
        const position: [number, number, number] = s.axis === 'x' ? [center, ROAD_Y, s.fixed] : [s.fixed, ROAD_Y, center]
        const size: [number, number] = s.axis === 'x' ? [length, s.width] : [s.width, length]
        return (
          <mesh key={`street-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
            <planeGeometry args={size} />
            <meshStandardMaterial color={PALETTE.asphalt} roughness={0.85} />
          </mesh>
        )
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, ROAD_WIDTH]} />
        <meshStandardMaterial color={PALETTE.asphalt} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y, LAKESIDE_SPAN[1]]} receiveShadow>
        <circleGeometry args={[ROAD_WIDTH / 2, 24]} />
        <meshStandardMaterial color={PALETTE.asphalt} roughness={0.85} />
      </mesh>
    </>
  )
}

/** Place driveways at the asphalt edge and keep them above the ground to avoid z-fighting. */
const DRIVEWAY_SIZE = TILE // matches the kit model's native 3x3m footprint at this scale
// Between sidewalks() (0.005) and roadSurfaces() (0.012, see its own
// comment) — a driveway crosses the sidewalk strip on its way from the
// road to the house, so it needs a height distinct from both neighbors
// it spatially overlaps, not just "somewhere near the ground."
const DRIVEWAY_Y = 0.008

function Driveways() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(DRIVEWAY_SIZE, DRIVEWAY_SIZE), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: PALETTE.pavement, roughness: 0.95 }), [])

  const positions = useMemo(() => {
    const houses = [...ATTRACTIONS.filter((a) => a.district === 'lakeside' && a.model), ...SUBURB_HOUSES.map((h) => ({ position: h.position }))]
    return houses.map((h) => {
      const [hx, , hz] = h.position
      const dx = hx > 0 ? 2.5 : -2.5 // halfway between the road edge and a ±9 lot
      return [dx, DRIVEWAY_Y, hz] as [number, number, number]
    })
  }, [])

  return (
    <Instances geometry={geometry} material={material} receiveShadow>
      {positions.map((p, i) => (
        <Instance key={i} position={p} rotation={[-Math.PI / 2, 0, 0]} />
      ))}
    </Instances>
  )
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

// Leave gaps in street furniture at parked camera positions to keep the stops clear.
const LAMP_ATTRACTION_MARGIN = 5

function tooCloseToAttraction(along: number, axis: 'x' | 'z', district: 'foundry' | 'lakeside'): boolean {
  return ATTRACTIONS.some((a) => a.district === district && Math.abs(a.position[axis === 'x' ? 0 : 2] - along) < LAMP_ATTRACTION_MARGIN)
}

/** Keep lamps on the sidewalks and leave the Plaza fixtures to the square. */
function streetlamps() {
  const lamps: Array<{ position: [number, number, number]; rotationY: number }> = []
  let side = 1
  for (let x = FOUNDRY_SPAN[0] + 8; x < -10; x += LAMP_INTERVAL, side *= -1) {
    if (tooCloseToAttraction(x, 'x', 'foundry')) continue
    lamps.push({ position: [x, 0, side * 3], rotationY: side > 0 ? 0 : Math.PI })
  }
  side = 1
  for (let z = LAKESIDE_SPAN[0] + 8; z < 82; z += LAMP_INTERVAL, side *= -1) {
    if (tooCloseToAttraction(z, 'z', 'lakeside')) continue
    lamps.push({ position: [side * 3, 0, z], rotationY: side > 0 ? -Math.PI / 2 : Math.PI / 2 })
  }
  return lamps.map((l, i) => (
    <Building
      key={`lamp-${i}`}
      model="/assets/models/light-square.glb"
      position={l.position}
      scale={5}
      rotationY={l.rotationY}
    />
  ))
}

const FURNITURE_INTERVAL = 22 // offset from LAMP_INTERVAL (16) so benches don't always line up with a lamp post
const SUBURB_FURNITURE_INTERVAL = 11

/** Stagger benches and bins to keep sidewalk furniture from overlapping. */
function streetFurniture() {
  const items: Array<{ position: [number, number, number]; rotationY: number }> = []
  let side = -1
  for (let x = FOUNDRY_SPAN[0] + 12; x < -14; x += FURNITURE_INTERVAL, side *= -1) {
    items.push({ position: [x, 0, side * 6], rotationY: side > 0 ? Math.PI : 0 })
  }
  side = -1
  for (let z = LAKESIDE_SPAN[0] + 12; z < 78; z += FURNITURE_INTERVAL, side *= -1) {
    items.push({ position: [side * 6, 0, z], rotationY: side > 0 ? -Math.PI / 2 : Math.PI / 2 })
  }
  return items.map((f, i) => (
    <group key={`furniture-${i}`}>
      <Bench position={f.position} rotationY={f.rotationY} />
      <TrashCan position={[f.position[0] + Math.sin(f.rotationY) * 1.2, 0, f.position[2] + Math.cos(f.rotationY) * 1.2]} />
    </group>
  ))
}

/** Place extra seating between existing Lakeside furniture positions. */
function suburbBenches() {
  const items: Array<{ position: [number, number, number]; rotationY: number }> = []
  let side = 1
  for (let z = LAKESIDE_SPAN[0] + 12 + SUBURB_FURNITURE_INTERVAL / 2; z < 82; z += SUBURB_FURNITURE_INTERVAL, side *= -1) {
    items.push({ position: [side * 6, 0, z], rotationY: side > 0 ? -Math.PI / 2 : Math.PI / 2 })
  }
  return items.map((f, i) => <Bench key={`suburb-bench-${i}`} position={f.position} rotationY={f.rotationY} />)
}

/** Close the decorative dead ends with barriers to make the road termination visible. */
function roadClosures() {
  const ends = CROSS_STREETS_X.flatMap((x) => [
    { x, z: CROSS_STREET_Z_SPAN[1], rotationY: 0 },
    { x, z: CROSS_STREET_Z_SPAN[0], rotationY: Math.PI },
  ])
  return ends.map((e, i) => (
    <group key={`closure-${i}`} position={[e.x, 0, e.z]} rotation={[0, e.rotationY, 0]}>
      <Building model="/assets/models/construction-barrier.glb" position={[0, 0, 0.3]} scale={6} />
      <Building model="/assets/models/construction-cone.glb" position={[-1.6, 0, 0.9]} scale={7} rotationY={0.4} />
      <Building model="/assets/models/construction-cone.glb" position={[-0.6, 0, 1.2]} scale={7} rotationY={-0.3} />
      <Building model="/assets/models/construction-cone.glb" position={[0.6, 0, 1.2]} scale={7} rotationY={0.6} />
      <Building model="/assets/models/construction-cone.glb" position={[1.6, 0, 0.9]} scale={7} rotationY={-0.5} />
    </group>
  ))
}

/** Connect the blocks with paved pedestrian strips between the roads and buildings. */
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

/** Instance the lane markings to keep draw calls low. */
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

/** Place dumpsters behind the buildings to suggest service access. */
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
      {/* Keep the Makers Club approach clear of the low street-name sign. */}
      {x !== -46 && (
        <Building model="/assets/models/road-sign-object-street.glb" position={[x - 1.5, 0, 4]} scale={6} />
      )}
      {/* Leave the near intersection clear in the Robotics arrival shot. */}
      {x !== -26 && (
        <Building model="/assets/models/road-sign-stop.glb" position={[x + 1.5, 0, -4]} scale={4} rotationY={Math.PI} />
      )}
    </group>
  ))
}

export default function RoadNetwork() {
  return (
    <group>
      {roadSurfaces()}

      <Building model="/assets/models/traffic-light.glb" position={[-6, 0, -3]} scale={4} rotationY={Math.PI / 2} />
      <Building model="/assets/models/road-sign-street.glb" position={[6, 0, -3]} scale={4} rotationY={-Math.PI / 2} />

      <CenterlineDashes span={[FOUNDRY_SPAN[0] + 2, -4]} axis="x" fixed={0} />
      <CenterlineDashes span={[4, LAKESIDE_SPAN[1] - 2]} axis="z" fixed={0} />
      {CROSS_STREETS_X.map((x) => (
        <CenterlineDashes key={`cross-dash-${x}`} span={[CROSS_STREET_Z_SPAN[0] + 2, CROSS_STREET_Z_SPAN[1] - 2]} axis="z" fixed={x} />
      ))}
      {sidewalks()}
      {utilityPoles()}
      {streetlamps()}
      {streetFurniture()}
      {suburbBenches()}
      {crossStreetSigns()}
      {alleyProps()}
      {roadClosures()}
      <Driveways />
    </group>
  )
}
