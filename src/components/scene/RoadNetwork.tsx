import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import Building from './Building'
import StreetLamp from './StreetLamp'
import Bench from './Bench'
import TrashCan from './TrashCan'
import { SUBURB_HOUSES } from '../../content/suburb-houses'
import { ATTRACTIONS } from '../../content/attractions'
import { PALETTE } from '../../config'

const TILE = 3 // road tiles are 1x1 native, scale 3 -> 3x3m

// PRD v3 §4.1/§4.4/§7.1, extended by PRD v4/v5 §4.2/§4.3 — the VISUAL road
// network: Main Street, the Lakeside street, both cross streets, the
// junction, and the Lakeside dead-end are all plain asphalt plane geometry
// plus a hand-added dashed centerline (see roadSurfaces()/
// CenterlineDashes below for why those are separate geometry rather than
// kit road tiles), driveways at every house, sidewalk paving strips
// between the road and each filler row, streetlamps at regular intervals,
// street signs at cross-street intersections, dumpsters tucked behind the
// back filler row, and awning/parasol clusters on a few storefronts —
// filling the ground that was previously bare between the road and the
// buildings (PRD v4 §2's "no empty space" goal). The car only ever
// *drives* the graph in src/lib/roadGraph.ts (§7.5's scope simplification,
// unchanged) — all of this is set dressing.
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

/** PRD v4 polish round 4/5 — the entire road SURFACE (Main Street, the
 * Lakeside street, both cross streets, the junction corner, and the
 * Lakeside dead-end) is plain asphalt-colored geometry now, not kit tiles.
 * Round 4 fixed Main/Lakeside this way after finding road-side.glb and
 * road-straight.glb share one texture that tiles into a busy band, not
 * clean asphalt. Round 5 finishes the job: road-bend-sidewalk.glb,
 * road-end-round.glb, and the cross streets' road-straight.glb/
 * road-crossroad.glb tiles had the exact same texture problem and now
 * visibly clashed with the clean Main/Lakeside surfaces next to them.
 *
 * Cross streets don't need a separate intersection tile where they meet
 * Main Street: two flat planes of the identical asphalt color simply
 * overlapping there is indistinguishable from one continuous surface — no
 * seam, no special geometry required, unlike the kit tile system this
 * replaces which needed a dedicated road-crossroad.glb piece to look
 * right. Same reasoning for the junction corner between Main Street and
 * the Lakeside street: one small square plane closes the L-shaped gap
 * between where each street's own plane ends, overlapping each by half a
 * lane width.
 *
 * PRD v5.0 §4.6 — height bumped from 0.01 to ROAD_Y (0.012): the plaza's
 * own pavement plane (PlazaSquare.tsx) sits at 0.01 too, and its bounds
 * spatially overlap this junction-fill square by a few square meters —
 * two coincident opaque planes at the exact same height is real
 * z-fighting (confirmed by computing both planes' actual bounds, not
 * guessed from the "flickering at the fork" report alone), not a
 * rendering artifact. A fractionally higher road height resolves the
 * overlap deterministically — the road reads as on top of the plaza
 * pavement there, which is the physically sensible choice anyway. */
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

/** A driveway connecting one Lakeside house to the street: perpendicular to
 * the street (which runs along Z), centered between the road edge and the
 * house's own lot.
 *
 * PRD v5.0 §4.6 — a plain paved plane (PALETTE.pavement, the same concrete
 * tone as the sidewalks), not road-driveway-single.glb. That kit model
 * turned out to share the exact same busy multi-swatch texture already
 * replaced everywhere else on the roads (road-side.glb, road-straight.glb,
 * etc.) — verified by extracting it, byte-identical — so every driveway
 * was still showing the wrong out-of-place pattern throughout the suburb.
 * Kept the <Instances> structure from the earlier round-5 perf fix (one
 * geometry/material, not a mesh per house) — a shared plane geometry
 * qualifies exactly the same way the shared GLB mesh did. */
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

// PRD v7.0 round 2 — a real attraction's parked camera sits at the curb
// point nearest its own position (roadGraph.ts's curbFor()), which for
// these two straight arms lands at the same along-the-road coordinate as
// the attraction's own position (the nearest point on a straight line only
// depends on the along-axis projection, not the perpendicular offset). The
// streetlamp loop below places lamps on a fixed interval with no idea
// where any attraction actually is — confirmed a real case where they
// collide: "More Coming Soon" (position z=58) landed 0.5m from a lamp at
// z=57.5, so the parked camera ends up almost touching the lamp post,
// which then fills most of the frame. Margin of 5m clears CAR_EYE_HEIGHT-
// scale parking geometry comfortably without visibly thinning the lamp
// line anywhere else (LAMP_INTERVAL is 16, so skipping one lamp near an
// attraction still leaves neighbors within a normal-looking distance).
const LAMP_ATTRACTION_MARGIN = 5

function tooCloseToAttraction(along: number, axis: 'x' | 'z', district: 'foundry' | 'lakeside'): boolean {
  return ATTRACTIONS.some((a) => a.district === district && Math.abs(a.position[axis === 'x' ? 0 : 2] - along) < LAMP_ATTRACTION_MARGIN)
}

/** PRD v4 §4.2 — regularly-spaced streetlamps along both Main Street and the
 * Lakeside street, alternating sides, in addition to the handful already
 * clustered at the Plaza (PlazaSquare.tsx). */
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

const FURNITURE_INTERVAL = 22 // offset from LAMP_INTERVAL (16) so benches don't always line up with a lamp post
const SUBURB_FURNITURE_INTERVAL = 11 // half FURNITURE_INTERVAL, phase-shifted below — the suburb-only "more benches along the street" pass (PRD v7.0 §1)

/** PRD v6.0 §1 — benches + trash cans along both sidewalks, between the
 * streetlamp line (±3) and the filler buildings (±16) — the sidewalk
 * itself (below) already paved this strip, but paving alone doesn't give
 * anyone a reason to actually be there. Same alternating-side, regular-
 * interval pattern streetlamps() already established, at a different
 * period so the two don't always land on top of each other. */
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

/** PRD v7.0 §1 — extra benches along the Lakeside street specifically, at
 * half streetFurniture()'s interval and offset so the two passes interleave
 * rather than double up at the same spot — the user's ask was explicitly
 * "benches along the side of the roads in the suburb areas," denser than
 * downtown, not a uniform bump to both districts. */
function suburbBenches() {
  const items: Array<{ position: [number, number, number]; rotationY: number }> = []
  let side = 1
  for (let z = LAKESIDE_SPAN[0] + 12 + SUBURB_FURNITURE_INTERVAL / 2; z < 82; z += SUBURB_FURNITURE_INTERVAL, side *= -1) {
    items.push({ position: [side * 6, 0, z], rotationY: side > 0 ? -Math.PI / 2 : Math.PI / 2 })
  }
  return items.map((f, i) => <Bench key={`suburb-bench-${i}`} position={f.position} rotationY={f.rotationY} />)
}

/** PRD v7.0 §1 — cones/barriers closing off both cross streets' dead ends
 * (CROSS_STREET_Z_SPAN's ±31 — these side streets never connect through to
 * anything, so a real city would have exactly this at the end of them),
 * the concrete "cones closing off side roads" example from the goal. A
 * small angled cone cluster plus one barrier per end, not a wall straight
 * across the lane — reads as "road work/dead end ahead," not a hard clip
 * a driver would visibly clip through. */
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
