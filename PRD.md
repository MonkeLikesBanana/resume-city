# Vasnova City — Interactive City Resume
### Product & Technical Design Document (PRD)
Status: v3.0 — ready to build · Owner: Aarav Vaswani

> **Revision note (v3.0):** major revision after seeing the v2.0 build. Five
> changes, in the order the user gave them, plus one explicit overall goal:
> 1. **Perpendicular districts** — the Welcome Plaza should sit at a corner where
>    both districts are visible from the same view, not at the midpoint of one
>    straight road where you can only ever see one direction at a time.
> 2. **Smoother travel** — driving between stops is currently jerky; needs to be
>    much smoother.
> 3. **Real-looking roads** — the current road tiles don't read as actual city
>    roads.
> 4. **Even more buildings** — the downtown density added in v2 wasn't enough;
>    go further.
> 5. **Lakeside as a real suburb** — houses (not downtown buildings), a
>    neighborhood feel, populated with amenities: a park, a basketball court, and
>    more.
>
> **Overall goal, stated explicitly by the user**: make this look as close to a
> real developed city and suburb as possible. **Do not shortcut anything.** Every
> design decision below is made against that bar.
>
> §3, §4, §7, §8, §9, §12, §13, §14, §16, §17 are rewritten below. §1, §2, §5,
> §6, §10, §11, §15 are carried over with light edits. §5's *facts* (every resume
> detail, every district/building assignment, all copy) are **unchanged** — only
> world geometry, road/camera systems, and district art direction change.
>
> **Revision note (v2.0):** downtown density, car-not-drone camera, forest
> backdrop, real entrance plaza, third-person copy — built and shipped.
>
> **Revision note (v1.2):** city renamed from the placeholder "Aaravville" to
> **Vasnova City**.
>
> **Revision note (v1.1):** v1.0 scoped this as a 2.5D isometric DOM scene;
> superseded by a **true 3D scene** (React Three Fiber / Three.js).

---

## 1. Overview

A single-page website that presents Aarav's resume as a small 3D city, explored
the way a visitor would actually arrive in a real one: **driving in**. The visitor
enters through the Welcome Plaza and from there the camera behaves like a car: it
drives along the city's roads to whichever building is clicked, at street level,
following the turns of the road, and when it arrives it pans/tilts up in place to
frame the building rather than flying to an elevated drone shot. The city is split
into two districts that meet at a right angle at the Plaza, not two ends of one
straight road:

- **The Foundry District** — a genuine downtown running west from the Plaza:
  career/achievements buildings fronting a Main Street, filled out with dozens of
  purely decorative buildings so it reads as a real skyline.
- **Lakeside** — a genuine suburb running south from the Plaza, perpendicular to
  Main Street: personal-interest buildings restyled as houses along a residential
  street, populated with more houses, a park, and a basketball court, next to an
  actual small lake (the district's namesake).

This is still a **curated, fixed-path experience** — the visitor never manually
steers; every navigation action is "click a thing → the car drives there along the
road → it stops and looks up → panel opens." (No manual drive/orbit/fly controls
exposed to the visitor — see §7.)

City name, district names, and every color/copy value below are config, not
hardcoded — see [§6](#6-tech-stack) and [§8](#8-data-model). `CITY_NAME` in
`src/config.ts` is `"Vasnova City"`.

## 2. Goals & Non-Goals

**Goals**
- Reads as an actual developed city and suburb, not a diorama — this is the bar
  the user set explicitly, and it governs every call below: don't shortcut
  density, road detail, or the suburb's amenities.
- Standing at the Welcome Plaza, both districts are visibly present in the same
  view — a real sense of "the whole city meets here," not "I'm on one long road."
- Driving between any two stops is smooth: no snap-turns, no rotational jerk, even
  through the Plaza's 90° corner where the two districts' roads meet.
- The roads themselves read as real city infrastructure — lane markings,
  sidewalks, driveways, traffic signals, utility poles — not bare flat tiles.
- The Foundry District reads as a dense downtown block; Lakeside reads as a
  populated residential neighborhood with its own distinct amenities, at a lower
  building density than downtown (a suburb should feel less dense than downtown —
  that's part of what makes it read as a suburb, not a mistake to fix).
- Every fact from the resume is still present verbatim — none of this changes what
  the site says, only the world it's set in.
- Adding a new attraction, filler building, or suburb house later is still a
  data-file-and-drop-a-model workflow (§16).

**Non-Goals (v3)**
- Still no manual drive/orbit/WASD control — the car drives itself.
- Still no true multi-street pathfinding graph. The road is now a **2-arm
  junction** (Foundry arm + Lakeside arm meeting at the Plaza), which is a small,
  fixed, hand-built special case — not general graph pathfinding. Revisit only if
  a future request adds a third arm or wants the car to choose between multiple
  routes to the same destination.
- No new asset packs to download — **confirmed by inventory**: every piece needed
  for v3 (road variety, suburb houses, park elements) already exists in the five
  Kenney packs extracted for v1/v2 (Building Kit, Commercial, Nature, Roads,
  Suburban — see §4.5). The basketball court/hoop has no equivalent in any pack on
  disk and is built from primitives instead (§4.4) — same technique already used
  for the Mountains backdrop.
- Sound design, custom domain, analytics: still deferred.

## 3. Experience Flow

```
Landing (Welcome Overlay, DOM, sits above the canvas)
  "Vasnova City" title card + "Enter the City" button
        ↓
Car "arrives" already parked in the Welcome Plaza's open square — a corner lot
where Main Street (Foundry, running west) and the Lakeside residential street
(running south) both begin. The home camera uses a wider field of view than
every other stop specifically so both roads are visible receding away from the
Plaza in the same shot (§7.7) — standing at the corner, you can see both of
Aarav's "sides" from one place. The Plaza IS the home state.
        ↓
Click a hotspot (or an AccessibleNav / breadcrumb / tour-control link) ──►
  A single continuous drive-and-look animation, not two separate phases handed
  off between two different systems (§7.3 replaces v2's CameraControls handoff
  entirely): the camera drives along the road graph from wherever it currently
  is to the target's curb point — through the Plaza corner if the trip crosses
  from one district to the other, smoothly rounding that turn rather than
  snapping through it — while its look-target blends continuously from "ahead
  along the road" to "the destination, tilted up by its height" over the final
  stretch of the approach. There is no visible seam between "driving" and
  "arriving" anymore.
        ↓
  Info panel slides in (DOM), breadcrumb updates: Vasnova City › District › Building
        ↓
  Click "Back to city" ─────────► car drives back to the Welcome Plaza
        ↓
  (repeat, any order — going from a Foundry stop to a Lakeside stop drives the
  Foundry leg, smoothly rounds the Plaza corner, then drives the Lakeside leg,
  all as one trip, §7.1)

Guided Tour: unchanged mechanically — same Next/Prev/Pause controls, same stop
order — each leg is now a corner-aware trip if it crosses districts.
```

Deep links and reduced-motion behavior are unchanged: landing on
`/foundry/robotics-workshop` snaps straight there, and `prefers-reduced-motion`
skips the drive animation entirely.

## 4. Visual & Art Direction — "Pacific NW Tech City ↔ Pacific NW Suburb"

Palette, typography, and district color-coding are unchanged (teal for Foundry,
terracotta for Lakeside). What changes is the world layout (a corner, not a line),
how much *more* downtown fills the Foundry arm, how much *real neighborhood* fills
the Lakeside arm, and how the road surface itself reads.

### 4.1 Downtown Foundry District — denser, and the road finally looks real

**Density.** v2 added 22 filler buildings in a single row on each side of Main
Street. v3 goes to **~60 filler buildings** arranged in actual **city blocks**:
multiple rows set back from the street at increasing depth (a sidewalk-front row,
then a second row behind it, etc.), not one strip. This is generated, not
hand-placed — `src/lib/blocks.ts` (§9) is a small seeded grid generator (same
Mulberry32 PRNG already used for the forest scatter) that takes a block's origin,
width/depth, row/column counts, and a pool of model paths, and returns a
`FillerBuilding[]` with small position/rotation jitter per lot so the block
doesn't look like a spreadsheet. Both the original 22-building pool and ~15
additional unused Commercial-pack variants (`building-a` through `-n`,
`building-skyscraper-a/c/d/e`, all 14 `low-detail-building-*`, both
`low-detail-building-wide-*` — 35 total variants available, per the actual
inventory on disk) feed this generator; low-detail variants are deliberately
biased toward the back rows, where less visual detail is needed and it helps
draw-call budget.

**The road itself.** v2's `RoadNetwork.tsx` used exactly two tile types
(`road-straight`, `road-crossroad`) with no lane markings, no sidewalks, no
signals — which is exactly why it read as fake. The Kenney Roads pack already
extracted on disk (`kenney/roads/`) has far more than that sitting unused:

- **`road-side.glb`** — a road tile with a sidewalk running down one edge. Main
  Street is rebuilt as two mirrored `road-side` rows (sidewalk – road – sidewalk),
  the actual cross-section of a real city street, instead of a bare road slab.
- **`road-crossroad-line.glb`** / **`road-intersection-line.glb`** — the same
  intersection shapes v2 used, but with painted lane markings. Cross streets use
  these instead of the unmarked version.
- **`traffic-light.glb`** and **`road-sign-street.glb`** at the busier
  intersections, **`electricity-pole.glb`** + **`electricity-wires.glb`** spaced
  periodically along Main Street — utility poles and wires are one of the single
  highest-value, lowest-cost details for reading as "developed city," and they
  were sitting unused in the pack the whole time.
- **`road-bend-sidewalk.glb`** — the corner tile the Plaza junction itself needs
  (§4.3, §7.1) — a 90° bend with sidewalk continuity, not a sharp unmarked corner.

None of this is a new download — every model named above already exists in
`kenney/roads/` from the original pack extraction; it was simply unused.

### 4.2 Forest backdrop — unchanged, with one relocation

The instanced forest belt (§4.2 in v2, unchanged mechanically — still
drei `<Instances>`, still 150–300 trees) stays as the horizon treatment behind
both arms. The one change: v2's lake, which used to bisect Main Street at the
Plaza, moves to Lakeside (§4.3, §4.4) — a district literally named for a lake
should have one nearby, and the perpendicular layout no longer needs a body of
water in the middle of a road junction.

### 4.3 Welcome Plaza — an open corner square, not a bridge crossing

v2's Plaza was a gate spanning a single road at its midpoint. That doesn't work
once the two districts meet at 90° instead of continuing in a straight line, and
it's also the reason you could only ever see one direction from it. v3 rebuilds
the Plaza as an actual **open paved square occupying the outside corner** of the
junction — the quadrant that isn't claimed by either arm — with the car's home
position parked inside that square, angled to face into the corner where both
roads begin (§7.7 has the exact camera mechanics).

- The **existing kitbashed gate** (`plaza-gate.glb`, §4.3 in v2 — two Building Kit
  columns + a stretched beam + a roof cap) is repositioned to mark the **Foundry
  arm's entrance** specifically — a monumental downtown gateway makes sense
  exactly where downtown starts, the same role it played in v2, just moved off
  the old bridge-crossing spot onto the corner square's edge.
- The **Lakeside arm's entrance** gets a lighter, residential-appropriate
  transition instead of a matching monument (a real suburb entrance is rarely a
  stone archway) — sidewalk gives way to the first driveway, flanking trees and
  planters mark the change, and the road surface itself shifts from Main
  Street's `road-side` cross-section to the residential street treatment (§4.4).
  A more distinct Lakeside signpost is a nice-to-have, not required — see §17.
- **Plaza paving** — a distinct ground-color patch (as in v2) sized to read as a
  real square, large enough to comfortably contain the home camera's wide-FOV
  vantage point (§7.7) without either arm's buildings crowding the frame.
- The Welcome Plaza's info-panel content (§5.0, unchanged, already third person)
  is unchanged — same intro, same contact block.

### 4.4 Lakeside — a real suburb (new in v3)

This is the single biggest new build. Lakeside stops being "a few isolated
buildings near some forest" and becomes an actual residential street:

- **The five existing attractions** (Café, Arcade, Sports Field, Open Road,
  "More Coming Soon") move onto the new south-running Lakeside street and each
  gets restyled as a house — an explicit `building-type-X` model from the
  Suburban pack (`kenney/suburban/` — 21 distinct house variants on disk,
  `building-type-a` through `-u`), with its own small yard: a short driveway
  (`driveway-short.glb`/`driveway-long.glb`) connecting the house to the street,
  and a low fence segment (the Suburban pack ships nine fence-length variants,
  `fence-1x2` through `fence-3x3`, plus `fence-low`/`fence`) marking the yard
  boundary — real yard dressing, not a bare model standing on grass.
- **New suburb filler houses** (`src/content/suburb-houses.ts`, §8/§9) — roughly
  **26 additional houses**, generated the same way as the downtown filler blocks
  (§4.1's `blocks.ts` generator, reused with suburb parameters), lining the rest
  of the street. Deliberately **lower density** than the Foundry blocks — real
  suburbs have more space per lot than a downtown block does; that's the
  difference that makes it read as a suburb rather than "downtown with houses."
- **A Park** — a dedicated lot along the street: a grass-colored ground patch, a
  winding path built from Nature Kit's `ground_path*` tiles (straight/bend/corner
  variants — already on disk, unused), a cluster of `tree-large.glb`/
  `tree-small.glb` (the Suburban pack's own trees — visibly different, rounder
  silhouettes than the forest's pine trees, which is the point: a park should
  look different from the wild forest belt behind it), scattered
  `flower_*A/B/C.glb` (nine color/shape variants in Nature Kit), a couple of
  `stump_round.glb`/`stump_square.glb` as rustic seating, and a handful of
  `rock_small*.glb` for landscaping.
- **A small pond** — the relocated lake feature (§4.2), sized to fit inside or
  beside the park, crossed by one of Nature Kit's small decorative footbridges
  (`bridge_wood.glb` or `bridge_stone.glb` — purely scenic, not part of the
  drivable road).
- **A basketball court** — no Kenney pack on disk has a basketball hoop or
  court, so this is built from primitives (§9, `BasketballCourt.tsx`): a
  rectangular asphalt-colored ground plane sized to real half/full-court
  proportions, thin box-geometry meshes for the boundary/key lines and a flat
  `ringGeometry` for the center circle (the same "build it directly, it's simple
  geometry" approach already used for the Mountains backdrop in `Ground.tsx` —
  not a shortcut, a precedented technique), and two hoop assemblies (a
  cylinder pole, a box backboard, a torus rim) at each end.
- **A cul-de-sac** at the far end of the street (`road-roundabout.glb` or
  `road-end-round.glb`) — real suburban streets end in a loop, not a wall.

### 4.5 Asset sourcing — still no new packs

Every model named in §4.1–§4.4 above was verified present in the five Kenney
packs already extracted at v1 (`kenney/{buildingkit,commercial,nature,roads,
suburban}/` — see the inventory this PRD was written against). The only genuinely
new work is: exporting more Draco-compressed variants from packs already on disk
(more Commercial buildings, more Roads pieces, the Suburban house/fence/driveway
set, Nature Kit's park pieces) and one new primitive-built component (the
basketball court/hoop, §4.4). No new Kenney pages to visit, nothing new to
license-check.

## 5. Content Map — Resume → City

**Facts, district assignment, and all copy are unchanged from v2** — every
resume detail lives on the same building it always did, still in third person.
What changes here is **where Lakeside's buildings physically sit** (the new
south-running arm, §4.4, instead of the old straight-road east side) and **what
model each one uses** (an explicit Suburban house type instead of whatever
commercial-style model it used before — verify and restyle each one during
implementation, §16). Nothing in §5.0–§5.2 of the v2 PRD needs re-reading; the
prose is final. §5.3 (the "flies" → "drives" copy pass) is **done** — no further
action.

## 6. Tech Stack

**One dependency removed, nothing added.** The `camera-controls` package
(wrapped by drei's `<CameraControls>`) is no longer used anywhere — §7.3 replaces
its damped `setLookAt()` transitions with a hand-rolled per-frame
position-plus-quaternion-slerp controller, since CameraControls' only remaining
job in v2 (the arrival tilt) was already fighting the same "built for occasional
calls, not per-frame driving" mismatch that v2's phase-1 drive already had to
work around by bypassing it. v3 just bypasses it for the whole trip instead of
half of it, and removes the now-pointless dependency. Everything else (R3F,
drei's `<Instances>`, `THREE.CurvePath`/`LineCurve3`, plus newly **`THREE.
CatmullRomCurve3`** for the Plaza corner blend, §7.1) is unchanged/already a
dependency via `three`.

## 7. World, Roads & Camera System

This section replaces v2 §7 entirely — the single linear `ROAD_PATH` becomes a
two-arm junction graph, and the two-phase CameraControls handoff becomes one
continuous hand-rolled controller.

### 7.1 The road graph — two arms, one junction

```ts
// src/content/road.ts — REWRITTEN
export type Arm = 'foundry' | 'lakeside'

// Junction at the world origin. Foundry runs west (-X); Lakeside runs south
// (+Z) — perpendicular by construction, satisfying "see both districts from
// the Plaza" (§7.7): two rays 90° apart from one vantage point are both
// visible in a single wide-enough field of view, which one continuous road
// never could be regardless of camera angle.
export const FOUNDRY_ARM: Vec3[] = [
  [0, 0, 0], [-8, 0, 0], [-16, 0, 0], [-26, 0, 0], [-36, 0, 0],
  [-46, 0, 0], [-58, 0, 0], [-66, 0, 0], [-76, 0, 0], [-90, 0, 0],
]
export const LAKESIDE_ARM: Vec3[] = [
  [0, 0, 0], [0, 0, 8], [0, 0, 16], [0, 0, 26], [0, 0, 36],
  [0, 0, 46], [0, 0, 58], [0, 0, 66], [0, 0, 76], [0, 0, 90],
]
```

```ts
// src/lib/roadGraph.ts — NEW (replaces src/lib/road.ts's single-curve model)
export interface RoadPosition { arm: Arm; t: number } // t: 0 at the junction, 1 at the arm's far end

export const ARM_CURVES: Record<Arm, THREE.CurvePath<THREE.Vector3>> = {
  foundry: buildRoadCurve(FOUNDRY_ARM),
  lakeside: buildRoadCurve(LAKESIDE_ARM),
}

// Each arm is still built from straight LineCurve3 segments (§7.1 in v2's
// rationale still holds on the long straight stretches — it matches the
// blocky Kenney tile aesthetic). The ONLY place that changes is the corner
// itself, built fresh per-trip in buildTripCurve() below.
const JUNCTION_BLEND_RADIUS = 10 // meters, on each arm, either side of t=0

// A trip is either same-arm (simple sub-range of one curve) or cross-arm
// (Foundry leg → smoothed corner → Lakeside leg, or vice versa).
export function buildTripCurve(from: RoadPosition, to: RoadPosition): THREE.Curve<THREE.Vector3> {
  if (from.arm === to.arm) return subCurve(ARM_CURVES[from.arm], from.t, to.t)

  // Cross-arm: take a short run-up on the source arm approaching the junction,
  // the junction point itself, and a short run-out on the destination arm —
  // and fit a CatmullRomCurve3 through just those points. This rounds the 90°
  // corner into a smooth arc instead of two straight legs meeting at a point,
  // which is what actually caused the "jerky" complaint at any cross-arm trip
  // (§7.3 also damps rotation independently, but a geometrically sharp corner
  // is jerky no matter how well the rotation is smoothed on top of it).
  const approach = pointAtDistanceFromEnd(ARM_CURVES[from.arm], from.t, JUNCTION_BLEND_RADIUS, /*towardT0*/ true)
  const junction = new THREE.Vector3(0, 0, 0)
  const depart = pointAtDistanceFromEnd(ARM_CURVES[to.arm], 0, JUNCTION_BLEND_RADIUS, /*towardT0*/ false)
  const corner = new THREE.CatmullRomCurve3([approach, junction, depart], false, 'catmullrom', 0.5)

  return joinCurves([
    subCurve(ARM_CURVES[from.arm], from.t, /* t at approach point */ tAtDistance(from.arm, from.t, JUNCTION_BLEND_RADIUS, true)),
    corner,
    subCurve(ARM_CURVES[to.arm], /* t at depart point */ tAtDistance(to.arm, 0, JUNCTION_BLEND_RADIUS, false), to.t),
  ])
}
```

`joinCurves()` is a small helper wrapping the pieces in one `THREE.CurvePath` so
the result still supports arc-length-correct `getPointAt(t)`/`getTangentAt(t)`
across the whole trip, corner included, exactly like v2's single curve did.

### 7.2 Curb points

Unchanged principle from v2: every attraction's parking spot defaults to the
nearest point on **its own arm's curve** to its `position`, now expressed as a
`RoadPosition` (`{ arm, t }`) instead of a bare `t` — the one data-model change
this forces (§8). An attraction may still override with an explicit `curb:
RoadPosition` if the automatic pick looks wrong, same "compute a sensible
default, override only when needed" philosophy as before.

### 7.3 The camera controller — one continuous animation, not two handed-off phases

```ts
// src/lib/camera.ts — REWRITTEN (replaces v2's stepDrive()/arriveAndTilt() pair
// and drops CameraControls from the driving path entirely, §6)

const ROTATION_SMOOTHING_RATE = 10 // 1/seconds — exponential slerp damping constant
const ARRIVAL_BLEND_FRACTION = 0.15 // last 15% of the trip blends toward the tilt target

function driveFrame(
  camera: THREE.PerspectiveCamera,
  tripCurve: THREE.Curve<THREE.Vector3>,
  progress: number,       // 0..1, already eased (easeInOutCubic on elapsed/duration — unchanged from v2)
  destination: Attraction,
  delta: number,
) {
  const p = tripCurve.getPointAt(progress)
  camera.position.set(p.x, p.y + CAR_EYE_HEIGHT, p.z)

  // Look target: blend from "ahead along the road" to "the destination,
  // tilted up by its height" over the final stretch — a smoothstep blend,
  // not a hard phase switch, so the tilt-up begins gradually while the car is
  // still rolling to a stop, the way a real driver's head turns before the
  // car fully parks, rather than stopping dead then snapping to look up.
  const aheadT = clamp(progress + 0.02, 0, 1)
  const ahead = tripCurve.getPointAt(aheadT)
  const aheadTarget = new THREE.Vector3(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z)

  const [dx, dy, dz] = destination.position
  const tiltTarget = new THREE.Vector3(dx, dy + destination.height * 0.6, dz)

  const arrivalBlend = smoothstep(1 - ARRIVAL_BLEND_FRACTION, 1, progress)
  const lookTarget = aheadTarget.lerp(tiltTarget, arrivalBlend)

  // Rotation is damped, not snapped — this is the other half of "less jerky,"
  // independent of the corner-rounding in roadGraph.ts. Frame-rate-independent
  // exponential smoothing (same mathematical family CameraControls used
  // internally, just applied directly since nothing is handed off anymore).
  const desiredQuat = quaternionLookingAt(camera.position, lookTarget)
  const damping = 1 - Math.exp(-ROTATION_SMOOTHING_RATE * delta)
  camera.quaternion.slerp(desiredQuat, damping)
}
```

One `useFrame` loop in `CameraRig.tsx` drives this from trip start to trip end;
there is no second system to hand off to and no "sync" call needed, because
there was never a discontinuity introduced in the first place. `CAR_EYE_HEIGHT`,
the `height`-based tilt formula, and the overall eased trip duration are
unchanged from v2 (§7.3 there) — only the mechanism moving the camera each frame
changes.

`prefers-reduced-motion` / deep links: unchanged rule — skip the animation, snap
directly to the destination's curb position and final look target.

### 7.4 No more free aerial overview

Unchanged from v2 — still retired, still no free bird's-eye shot anywhere.

### 7.5 Scope simplification, stated explicitly

The road is a **2-arm junction**, hand-built as a special case (§7.1) — not a
general pathfinding graph. This still satisfies the "perpendicular districts,
visible together" ask without building real multi-route pathfinding, which
remains out of scope (§2) unless a future request adds a third arm or wants
route choice.

### 7.6 Hotspots

Unchanged from v2.

### 7.7 The home shot — seeing both districts at once

The Welcome Plaza is the one place in the city with a non-default field of view:

```ts
// src/config.ts additions
export const DEFAULT_FOV = 55   // every attraction's arrival shot, unchanged from v2
export const HOME_FOV = 75      // Welcome Plaza only — wide enough to hold both
                                  // 90°-apart arms in frame from one vantage point
```

`CameraRig` sets `camera.fov` (and calls `updateProjectionMatrix()`) based on
whether the current destination is the Plaza (home state) or a regular
attraction. The Plaza's parked position sits inside the open corner square
(§4.3), offset along the square's diagonal so both arms' entrances are
comfortably inside the wider frame rather than at its extreme edges — the exact
offset is implementation-time visual-tuning work, verified via screenshot the
same way v1/v2 left exact camera numbers to be tuned against the running scene
rather than computed by hand up front.

## 8. Data Model

```ts
// src/types/attraction.ts — CHANGED
export type Arm = 'foundry' | 'lakeside'
export interface RoadPosition { arm: Arm; t: number }

export interface Attraction {
  id: string
  district: District          // unchanged — 'foundry' | 'lakeside' | 'plaza'
  name: string
  subtitle: string
  position: Vec3
  height: number
  curb?: RoadPosition          // CHANGED from v2's bare `curbT?: number` — now
                                // arm-aware. Default: nearest point on the
                                // matching arm's curve to `position` (§7.2).
  rotationY?: number
  scale?: number
  model?: string
  timeline?: TimelineEntry[]
  description?: string
  facts?: string[]
  tags: string[]
  accentColor: 'foundry' | 'lakeside'
}

// Unchanged shape from v2 — still used for both downtown filler and, new in
// v3, suburb filler houses (two separate content-file lists, one shared type).
export interface FillerBuilding {
  model: string
  position: Vec3
  rotationY?: number
  scale?: number
}
```

```ts
// src/lib/blocks.ts — NEW
export interface BlockSpec {
  originX: number; originZ: number   // corner of the block, in world space
  rows: number; cols: number          // lot grid
  rowSpacing: number; colSpacing: number
  axis: 'x' | 'z'                     // which world axis the block's "columns" run along (matches the arm's own direction)
  models: string[]                     // pool to sample from
  seed: number
}
export function generateBlock(spec: BlockSpec): FillerBuilding[]
// Seeded (Mulberry32, same PRNG as Forest.tsx) grid placement with small
// per-lot position/rotation jitter. Used for both Foundry downtown blocks
// (§4.1, denser: smaller spacing, more rows) and Lakeside suburb blocks
// (§4.4, sparser: larger spacing, fewer rows) — one generator, two parameter
// sets, which is the whole point of building it as a generator rather than
// hand-listing ~86 entries.
```

```ts
// src/content/suburb-houses.ts — NEW, generated via blocks.ts + hand-placed
// yard dressing (driveway/fence per named attraction, §4.4)
export const SUBURB_HOUSES: FillerBuilding[] = [ /* ~26 entries */ ]
```

**Migration note for `attractions.ts`**: every Lakeside entry's `position` moves
from the old east-of-Plaza scheme to the new south-of-Plaza (+Z) scheme;
`curbT?: number` fields (if any were set as overrides) become `curb?:
RoadPosition`; each entry's `model` is verified/changed to an explicit Suburban
`building-type-X`.

## 9. Component Architecture

Additions and changes only — everything not listed here is unchanged from v2 §9.

```
src/
  lib/
    roadGraph.ts             NEW — RoadPosition, ARM_CURVES, buildTripCurve() (§7.1); replaces road.ts's single-curve model
    blocks.ts                NEW — generateBlock() seeded grid generator (§8), shared by downtown + suburb
    camera.ts                REWRITTEN — single driveFrame() controller (§7.3); stepDrive()/arriveAndTilt() removed
  content/
    road.ts                  REWRITTEN — FOUNDRY_ARM/LAKESIDE_ARM waypoints (§7.1), replaces the single ROAD_PATH
    foundry-blocks.ts        NEW — generateBlock() calls producing the ~60-building downtown filler list
    suburb-houses.ts         NEW — generateBlock() calls + per-attraction yard dressing producing the ~26-house suburb filler list (§8)
  components/
    scene/
      CameraRig.tsx           REWRITTEN — single useFrame trip-driver (§7.3), no CameraControls import
      RoadNetwork.tsx         REWRITTEN — realistic Main Street cross-section, junction bend, driveways, utility poles/signals (§4.1)
      PlazaSquare.tsx          RENAMED from Plaza.tsx — open corner square, repositioned gate, Lakeside entrance transition (§4.3)
      Suburb.tsx               NEW — maps SUBURB_HOUSES + attraction yard dressing to <Building> (mirrors FillerBuildings.tsx)
      Park.tsx                 NEW — grass lot, paths, trees, flowers, pond + footbridge (§4.4)
      BasketballCourt.tsx      NEW — primitive-built court + two hoops (§4.4)
      FillerBuildings.tsx      MODIFIED — now sourced from foundry-blocks.ts; grouped by model type and rendered via drei <Instances> (§12), not one <Building> per entry
```

`CameraRig.tsx` no longer imports `camera-controls` at all (§6) — it owns the
entire per-frame camera write, position and rotation both, for every trip.

## 10. Accessibility & SEO

Unchanged from v2, plus: **suburb filler houses follow the exact same rule as
downtown filler buildings** (§10 in v2) — never a hotspot marker, never in
`AccessibleNav`, never focusable. The basketball court and park are scenery,
same rule.

## 11. Responsive / Mobile

Unchanged from v2.

## 12. Performance Budget

- Total scene triangle count: bump target to **< 600k** (was 350k) — roughly
  triples the filler-building count across both districts plus the park/court
  detail. Still low-poly Kenney assets; v2's actual measurement (82k triangles
  at the single most geometry-dense shot, the old Plaza establishing view) had
  enormous headroom under any real GPU, so this remains conservative, not risky.
- **Filler buildings are now instanced by model type**, not individually cloned
  (§9) — with the count roughly tripling (22 → ~86 across both districts), this
  moves from "nice to have" (v2, at 22) to "do it the same way the forest
  already does it" (v3) — group `FillerBuilding[]`/`SUBURB_HOUSES` entries by
  `model`, one drei `<Instances>` block per unique model path.
- Total 3D asset payload: still comfortably **< 12MB** — every new model is an
  already-downloaded, Draco-compressible variant from a pack on disk; no new
  packs, no large new textures.
- FPS/Lighthouse targets unchanged from v2 — re-verify, don't assume v2's
  numbers hold after this much added geometry. **Testing note carried over from
  v2 QA**: this project's sandbox renders WebGL via SwiftShader (software, no
  real GPU) — draw-call/triangle counts from `renderer.info` are the meaningful,
  hardware-independent signal here, not raw FPS measured in this environment.

## 13. Build Phases

Continues numbering — v2 shipped through Phase 13.

**Phase 14 — Road graph + continuous camera controller (highest technical risk —
build and validate against the *existing* v2 world layout first, before touching
any positions)**
Build `roadGraph.ts` (`RoadPosition`, `ARM_CURVES`, `buildTripCurve()` with the
Catmull-Rom junction blend), rewrite `camera.ts`/`CameraRig.tsx` for the single
continuous controller (§7.3), remove the `camera-controls` dependency. Prove
smooth same-arm trips and smooth cross-arm trips (a synthetic test junction is
fine here) before Phase 15 touches real world geometry — this isolates the
hardest new mechanic exactly the way v2's Phase 8 did for the original road
system.

**Phase 15 — Junction world layout**
Reposition Lakeside's five attractions onto the new south-running arm; rebuild
`RoadNetwork.tsx` with the realistic Main Street cross-section, the junction
bend tile, driveways, utility poles, and traffic signals (§4.1). Rebuild
`PlazaSquare.tsx` — open corner square, gate repositioned to the Foundry
entrance, Lakeside's lighter transition (§4.3). Retire the old lake+bridge.

**Phase 16 — Downtown density scale-up**
Build `lib/blocks.ts`, generate `foundry-blocks.ts` (~60 entries, multiple
rows/depths), switch `FillerBuildings.tsx` to instanced-by-type rendering
(§12). Verify from car-eye height along a full Main Street drive, not from an
aerial screenshot.

**Phase 17 — Lakeside Suburb**
Restyle the five Lakeside attractions to explicit Suburban house models +
driveway/fence yard dressing; generate `suburb-houses.ts` (~26 entries, lower
density than downtown); build `Park.tsx` and `BasketballCourt.tsx`; add the
cul-de-sac at the street's end.

**Phase 18 — Home shot tuning**
Set `HOME_FOV`, tune the Plaza's parked position/orientation until both arms
read clearly in the home shot (§7.7) — verified via screenshot, iterated live
against the running scene.

**Phase 19 — Re-QA & redeploy**
Full regression per §14, redeploy. Re-measure everything — don't assume any v2
QA result still holds after this much world change.

## 14. QA Checklist

Everything in v2's §14 still applies; these are additions specific to v3.

- [ ] From the Welcome Plaza's home shot, both the Foundry arm and the Lakeside
      arm are visibly present in the same frame, not just technically within
      the FOV's mathematical bounds — a human glance should read "two roads
      meeting here," not "one road with something small in the corner of frame"
- [ ] A cross-arm trip (any Foundry stop → any Lakeside stop or back) shows no
      visible snap in heading through the Plaza corner — compare consecutive
      frame screenshots through the turn, not just the start/end poses
- [ ] A same-arm trip is at least as smooth as it was in v2 (the rotation
      damping in §7.3 is new — confirm it didn't introduce lag/overshoot on the
      simple case while fixing the corner case)
- [ ] Main Street reads as a real street from car height: sidewalks, lane
      markings at intersections, at least a few utility poles/signals visible
      along a full drive — not just "more buildings," the road surface itself
- [ ] Lakeside reads as visibly lower-density than Foundry from car height —
      this is a deliberate goal (§2), not a bug to "fix" by matching downtown's
      density
- [ ] The park and basketball court are both reachable by driving past them
      (visible from the road) even though neither is a clickable stop
      (confirm this is the intended non-interactive scope, §4.4 — not a
      missing feature)
- [ ] Filler buildings AND suburb houses never show a hotspot marker, never
      appear in `AccessibleNav`, never respond to a click or Tab stop
- [ ] Instancing-by-type is confirmed in the actual renderer (draw call count
      via `renderer.info`, not just "it looks dense enough") given the
      building count roughly tripled
- [ ] Total triangle count re-measured against §12's updated budget
- [ ] Full cross-browser/mobile/keyboard/Lighthouse regression re-run, same
      discipline as v2's Phase 13

## 15. Deployment

Unchanged from v2.

## 16. Runbook — Adding to the City

### 16a. Adding a new Attraction

Same as v2, with one field change: set `curb?: RoadPosition` (`{ arm, t }`), not
a bare `curbT` number, if the automatic nearest-point default needs an override.
Specify which `arm` the attraction's `position` is meant to sit near — the
nearest-point search only looks at that one arm's curve, not both.

### 16b. Adding a new downtown Filler building

Unchanged from v2, except the list lives in `foundry-blocks.ts` (generated via
`blocks.ts`, §8) rather than a flat hand-written array — add a one-off entry to
the same file's manual-additions array if it doesn't fit the block generator's
grid (e.g. a landmark filler building at an odd lot), or add it to a block
spec's `models` pool if it's just more variety for the generator to place.

### 16c. Adding a new suburb House (Lakeside filler, new in v3)

Mirrors 16b: pick a Suburban `building-type-X` model, add it to
`suburb-houses.ts`'s block spec pool (or as a one-off manual entry with its own
driveway/fence dressing if it's meant to feel like a named lot rather than
background filler). Keep spacing sparser than the downtown generator's
defaults — that's what keeps the suburb reading as a suburb (§2).

## 17. Open Questions / Future Enhancements

- **A dedicated Lakeside entrance sign/marker** (§4.3) — scoped out of v3 as a
  nice-to-have; the road-surface transition + flanking trees/planters is
  judged sufficient to mark the change, but a literal small neighborhood sign
  would be a natural v4 addition if the corner still feels asymmetric once
  built.
- **A net mesh on the basketball hoops** (§4.4) — cosmetic, deferred; the rim +
  backboard alone reads clearly at this low-poly scale.
- Exact junction blend radius, home-shot FOV/offset numbers, and block-generator
  spacing constants are implementation-time visual-tuning work — this document
  specifies the systems and the target feel, not final numbers, consistent with
  how v1/v2 left exact camera and layout numbers to be tuned against the running
  scene.
- Carried over, still open: Onshape → Blender → GLB pipeline for a genuinely
  custom flagship building; custom domain; sound design.
