import { useMemo } from 'react'
import Building from './Building'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'

const TILE = 3 // road tiles are 1x1 native, scale 3 -> 3x3m

// PRD v3 §4.1/§4.4/§7.1 — the VISUAL road network: Main Street (Foundry,
// running west from the junction) built from road-side tiles (sidewalk +
// road edge, not the bare road-straight v2 used), the Lakeside residential
// street (running south) in the same treatment, a road-bend-sidewalk tile
// at the junction itself, driveways at every Lakeside house, a cul-de-sac
// cap at the street's end, plus utility poles/wires and a couple of
// intersection props for "developed city" texture. The car only ever
// *drives* the graph in src/lib/roadGraph.ts (§7.5's scope simplification,
// unchanged) — this is set dressing the drivable path's straight-line
// waypoints already imply, not a separate route.
const FOUNDRY_SPAN: [number, number] = [-90, -1.5] // stops short of the junction tile itself
const LAKESIDE_SPAN: [number, number] = [1.5, 88.5] // stops short of the junction; cul-de-sac caps the far end
const CROSS_STREETS_X = [-26, -46]
const CROSS_STREET_Z_SPAN: [number, number] = [-31, 31]

// PRD v3 §7.1 — matches the corner rotation used everywhere else in the
// scene; road-bend-sidewalk.glb's own native orientation connects a -Z-facing
// edge to a -X-facing edge, which is exactly "west leg to south leg" already —
// no rotation needed. If a future asset swap changes that, this is the one
// constant to flip through 0/90/180/270 while checking a screenshot.
const JUNCTION_ROTATION = 0

const POLE_INTERVAL = 24 // meters between utility poles along Main Street

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

export default function RoadNetwork() {
  const mainStreetTiles = useMemo(() => tilePositions(FOUNDRY_SPAN, 'x', 0), [])
  const lakesideStreetTiles = useMemo(() => tilePositions(LAKESIDE_SPAN, 'z', 0), [])
  const crossStreetTiles = useMemo(
    () => CROSS_STREETS_X.flatMap((x) => tilePositions(CROSS_STREET_Z_SPAN, 'z', x).filter((p) => Math.abs(p[2]) > TILE / 2)),
    [],
  )

  return (
    <group>
      {mainStreetTiles.map((p, i) => (
        <Building key={`main-${i}`} model="/assets/models/road-side.glb" position={p} scale={TILE} rotationY={Math.PI / 2} />
      ))}
      {lakesideStreetTiles.map((p, i) => (
        <Building key={`lakeside-${i}`} model="/assets/models/road-side.glb" position={p} scale={TILE} />
      ))}
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

      {utilityPoles()}
      {driveways()}
    </group>
  )
}
