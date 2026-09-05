# Vasnova City — Interactive City Resume
### Product & Technical Design Document (PRD)
Status: v2.0 — ready to build · Owner: Aarav Vaswani

> **Revision note (v2.0):** major revision after seeing the v1 build. Five
> changes, in the order the user gave them:
> 1. **Downtown density** — the Foundry District needs many more buildings, most
>    of them purely decorative (not every building has to map to a resume bullet).
> 2. **Car, not drone** — the camera now drives along roads at ground level
>    between stops, and pans/tilts up in place to frame a tall building on
>    arrival, instead of flying a free 3D arc to an elevated vantage point.
> 3. **Denser backdrop** — a real forest belt around the city, not a sparse ring
>    of distant mountain cones, since a ground-level "car" camera sees the
>    horizon far more than the old aerial view did.
> 4. **A real entrance** — the Welcome Plaza becomes an actual gateway/town
>    square, not just "the bridge."
> 5. **Third person copy** — all first-person resume/interest text rewritten in
>    third person.
>
> §3, §4, §5 (copy only), §7, §8, §9, §12, §13, §14, §16 are rewritten below.
> §1, §2, §6, §10, §11, §15 are carried over with light edits. §5's *facts*
> (every resume detail, every district/building assignment) are **unchanged** —
> only the prose voice and the Welcome Plaza's physical design changed, not what
> it says or where it sits in the layout.
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
enters through the Welcome Plaza — a proper gateway, not a bridge — and from there
the camera behaves like a car: it drives along the city's roads to whichever
building is clicked, at street level, following the turns of the road, and when it
arrives it pans/tilts up in place to frame the building rather than flying up to
some elevated drone shot. The city is split into two districts:

- **The Foundry District** — a genuine downtown: career/achievements buildings
  (robotics, startup, school, clubs) fronting a Main Street, filled out with many
  more purely decorative buildings so it reads as a real skyline, not six lonely
  structures on an empty plain.
- **Lakeside** — career's opposite number: personal interests, quieter and more
  spread out, matching a residential neighborhood rather than a downtown.

This is still a **curated, fixed-path experience**, not an open world — the
visitor never manually steers; every navigation action is "click a thing → the
car drives there along the road → it stops and looks up → panel opens." (No
manual drive/orbit/fly controls exposed to the visitor — see §7 for the full
mechanic.)

City name, district names, and every color/copy value below are config, not
hardcoded — see [§6](#6-tech-stack) and [§8](#8-data-model). `CITY_NAME` in
`src/config.ts` is `"Vasnova City"`.

## 2. Goals & Non-Goals

**Goals**
- Reads as an actual small city — a downtown with real density, a road network
  the camera visibly travels, a forest that makes the world feel enclosed rather
  than a diorama floating on an empty plain.
- Feels like riding in a car through town, not a drone touring waypoints: ground
  level, following turns, looking up at things rather than swooping over them.
- Every fact from the resume is still present verbatim or near-verbatim — none of
  this changes what the site says, only how it's arranged and how you get there.
- Every quote/blurb about Aarav reads naturally in third person, as if written by
  someone introducing him, not by Aarav himself.
- Adding a new attraction, or a new plain decorative building, later is still a
  data-file-and-drop-a-model workflow (§16) — the downtown-density system must not
  turn "add one filler building" into real work.

**Non-Goals (v2)**
- Still no manual drive/orbit/WASD control — the car drives itself; clicking is
  the only input (carried over from v1's non-goal).
- No true multi-street pathfinding graph (§7.5) — the road *looks* like a real
  grid, but the car follows one fixed, continuous route through it. Revisit only
  if a future request specifically wants the car to choose different streets.
- No new asset packs to download — everything in this revision (filler buildings,
  forest, plaza gate) is built from Kenney packs already downloaded for v1 (most
  of the Commercial pack's ~30 building variants went unused in v1; this is where
  they get used).
- Sound design, custom domain, analytics: still deferred (unchanged from v1 §17).

## 3. Experience Flow

```
Landing (Welcome Overlay, DOM, sits above the canvas)
  "Vasnova City" title card + "Enter the City" button
        ↓
Car "arrives" already parked at the Welcome Plaza — the city's entrance/gateway,
at the bridge crossing between the two districts (§7.6). There is no free aerial
overview shot in v2 (v1's OVERVIEW_SHOT is retired) — the whole experience is
lived at street level, matching an actual car's-eye view. The Plaza IS the home
state: this is where the visitor starts, and where "back to city" returns them.
        ↓
Click a hotspot (or an AccessibleNav / breadcrumb / tour-control link) ──►
  PHASE 1 — DRIVE: the camera moves along the road from its current position to
  the target building's curb point, at car height, following the road's turns
  (§7.3). This is not a point-to-point flight — it takes the actual path.
        ↓
  PHASE 2 — ARRIVE: the camera holds its position at the curb and pans/tilts up
  in place to frame the building — taller buildings tilt further back. It never
  re-flies to a higher vantage point to get a better angle; if the building is
  tall, panning up IS the answer (§7.3).
        ↓
  Info panel slides in (DOM), breadcrumb updates: Vasnova City › District › Building
        ↓
  Click "Back to city" ─────────► car drives back to the Welcome Plaza
        ↓
  (repeat, any order, any number of times — going from any stop to any other
  stop just drives the intervening stretch of road, the same mechanic either way)

Guided Tour: drives the same route start to end in the existing tour order
(Welcome Plaza → Robotics Workshop → NEEMO → Academic Hall → Makers Club → DECA →
FLL → Café → Arcade → Sports Field → Open Road) with Next/Prev/Pause controls —
unchanged from v1 except that each leg is now a drive, not a flight.
```

Deep links and reduced-motion behavior are unchanged from v1: landing on
`/foundry/robotics-workshop` snaps straight there (no animated drive, no flight —
an instant cut, same rule as before just applied to the new mechanic), and
`prefers-reduced-motion` skips the drive animation entirely rather than easing it.

## 4. Visual & Art Direction — "Pacific NW Tech City"

Palette, typography, and the district-color-coding rationale are **unchanged from
v1** (teal for Foundry, terracotta for Lakeside, self-hosted Fredoka/Space
Grotesk). What changes is how much *world* surrounds the visitor, because a
street-level car camera sees far more of the horizon than the old aerial shot did
— an empty plain that looked fine from above reads as sparse and unfinished from
the driver's seat.

### 4.1 Downtown Foundry District (new)

The Foundry District becomes a real small downtown: one **Main Street** (the road
the car actually drives, §7.1) plus one or two **cross streets** for a visual grid
(Kenney Roads' crossroad/intersection/bend tiles — already downloaded, mostly
unused in v1). The six resume-linked attractions (Robotics Workshop, NEEMO HQ,
Academic Hall, Makers Club, DECA, FLL Center) keep their prominent Main Street
lots. Everything else — roughly **18–24 additional buildings** — is purely
decorative "filler": ordinary downtown structures with no resume content, no
hotspot marker, and no click handler, filling out the cross streets and the gaps
between the named buildings so the skyline reads as a real city block, not six
landmarks in a void.

Filler buildings are sourced entirely from models **already downloaded** for v1 —
the extracted City Kit (Commercial) pack has ~30 building variants
(`building-a` through `building-n`, `building-skyscraper-a/c/d/e`,
`low-detail-building-a` through `-n`, the `low-detail-building-wide` pair), and v1
only used six of them. Pull a Draco-compressed variety pack of the unused ones
(same `gltf-pipeline` step as §4.3) rather than downloading anything new.

### 4.2 Forest backdrop (replaces the sparse tree ring)

v1's dozen ornamental trees plus a distant ring of mountain cones worked for an
aerial view where you could see the whole ground plane at once; at car height,
that same treatment reads as a mostly-empty tan plain with a mountain wallpaper
far in the distance. v2 adds a genuinely **dense forest belt** — on the order of
150–300 trees — occupying the band between the buildable city area and the
distant mountains, using the same three tree models from v1 (no new assets),
placed with enough density that looking sideways off the road at any point along
the drive shows forest, not empty ground. This must be **GPU-instanced** (drei's
`<Instances>`/`<Instance>`, not one `<Clone>` per tree) — see §12, this is a
performance requirement at this tree count, not a nice-to-have.

### 4.3 Welcome Plaza — a real entrance (replaces "it's just the bridge")

The Plaza is now the deliberate first and last thing every visit touches: a
gateway/town-square at the bridge crossing (still geographically the center point
between the two districts — that doesn't change), dressed as an actual entrance
rather than left as bare bridge tiles:

- A **welcome arch/gate** spanning the road at the plaza — kitbashed from Building
  Kit columns + a flat roof piece, the same programmatic-kitbash technique used
  for the Robotics Workshop in v1 (§4.4, `scripts/kitbash-workshop.mjs` is the
  template to extend/copy for this).
- Distinct **plaza paving** — a ground-color patch distinguishable from the plain
  city ground, sized to read as a proper square around the arch.
- **Welcome signage** (a simple sign prop, or text integrated into the arch),
  benches/lamps/planters — all props already available from the Roads and
  Suburban packs (`streetlamp.glb`, `planter.glb`, `fence.glb`).
- This is also where the Welcome Plaza's info panel content (§5.0, now in third
  person) is read — the intro and contact info are the first thing a visitor sees
  after entering.

### 4.4 Asset sourcing — no new packs

Everything above reuses packs already downloaded for v1 (§4.1 of the original
plan: City Kit Commercial/Suburban/Roads, Building Kit, the nature pack). The only
new work is **exporting more variants** from packs already on disk (more
Commercial buildings for filler, more tree instances from the existing 3 tree
models) and **one more kitbash** (the plaza arch, same technique/tooling as the
Robotics Workshop). No new Kenney pages to visit, nothing new to license-check.

## 5. Content Map — Resume → City

**Facts, district assignment, and per-building content are unchanged from v1** —
every resume detail still lives on exactly the building it lived on before. What
changes here is the **voice** (first person → third person) and the **physical
design** of the Welcome Plaza stop (§4.3) and the Foundry District's surroundings
(§4.1) — not what any panel says.

### 5.0 Welcome Plaza — updated copy (third person)

> "Aarav is a driven student interested in robotics, electronics, and business.
> Throughout his two years in high school, he's been part of the Saints Robotics
> FRC team, mentored FLL teams, taken the most rigorous academic courseload
> available to him, and competed in business events. His ultimate goal is to have
> a positive impact on the world through innovation and entrepreneurship."

Contact: Bellevue, Washington · (425) 531-2273 · aarav.vaswani@gmail.com
(unchanged — a contact block, not a first-person statement, so nothing to convert)

### 5.1 The Foundry District — unchanged content, new surroundings

All six attractions (Robotics Workshop, NEEMO HQ, Academic Hall, Makers Club,
DECA, FLL Center) keep the **exact copy, tags, and timeline content from v1** —
see the v1.2 text if you need to re-check it verbatim; none of those bullets
contain first-person language to begin with (standard resume-bullet style, no
"I"), so there's nothing to convert there. What's new is everything *around*
them: §4.1's downtown density and §7's road system.

### 5.2 Lakeside — updated copy (third person)

**1. The Café**
> "He runs on coffee, and he's always down for sushi or Indian food. He enjoys
> cooking too — even if the results are hit or miss."

**2. Arcade / Game Room**
> "He's been playing video games for as long as he can remember — Minecraft is
> the all-time favorite."

**3. Sports Field**
> "He's into pretty much any sport — not amazing at any one of them, but always
> up for playing."

**4. The Open Road**
> "He loves driving — any excuse to be behind the wheel." (this one gets to stay
> almost word for word — it's already about driving, which is a nice coincidence
> given the whole site now drives)

**5. "More Coming Soon" lot** — unchanged, still an empty construction-prop lot,
still the live example for §16.

### 5.3 Other copy that referenced flying (needs the same voice pass)

Anywhere the UI copy described the old mechanic needs a word swap, not a content
change:
- `WelcomeOverlay.tsx` tagline: *"Aarav Vaswani's résumé, built as a small city —
  click a building, the camera flies you there."* → **"Aarav Vaswani's résumé,
  built as a small city you can drive through — click a building, and the car
  takes you there."**
- `index.html` `og:description`: *"A résumé built as a small 3D city. Click a
  building, the camera flies you there."* → same "flies" → "drives" swap.
- Grep the codebase for "flies"/"flight"/"fly to" in user-facing strings (not
  code comments or variable names — `flyTo` as an internal function name is fine
  to rename or leave, that's implementation detail) before calling this phase
  done.

## 6. Tech Stack

**Unchanged from v1** — no new dependencies. Two additions worth calling out
explicitly since they're newly *load-bearing* rather than available-but-unused:

- **`THREE.CurvePath` + `THREE.LineCurve3`** (both already ship with `three`,
  already a dependency via R3F) — used to build the drivable road path (§7.1).
  `CurvePath.getPointAt(t)` handles arc-length parametrization across a chain of
  segments automatically (each child curve is weighted by its own `getLength()`),
  so a global `t ∈ [0,1]` maps to uniform distance along the *whole* route
  regardless of individual segment lengths — no hand-rolled distance table needed.
- **drei's `<Instances>`/`<Instance>`** — listed in v1's tech table but never
  actually used (v1's dozen trees were individual `<Clone>` calls, fine at that
  count). Now required for the forest belt (§4.2, §12) — true GPU instancing, one
  draw call per tree *type* regardless of how many hundred are placed.

## 7. World, Roads & Camera System

This section replaces v1 §7 almost entirely — the point-to-point `flyTo()` /
`computeDefaultShot()` system is gone, replaced by a two-phase drive-then-tilt
system driven by an actual road path.

### 7.1 The road path

A single continuous drivable route, `ROAD_PATH` — an ordered list of world-space
waypoints — built into a `THREE.CurvePath` of `THREE.LineCurve3` segments (one
straight segment between each consecutive waypoint pair). **Straight segments, not
a smooth spline** — this matches the blocky Kenney road-tile aesthetic (the visual
road is built from straight/bend/intersection tiles, not a curved ribbon), so the
car's motion should visibly turn at corners the way the tiles do, not glide
through a smoothed curve.

The waypoint order **follows the existing guided-tour sequence** (§3): Welcome
Plaza → Robotics Workshop → NEEMO HQ → Academic Hall → Makers Club → DECA → FLL
Center → *(back across the bridge through the Plaza)* → Café → Arcade → Sports
Field → Open Road, with enough intermediate waypoints along each leg to trace the
actual visual road tiles (including corners at cross-street intersections in the
Foundry downtown grid, §4.1). Reusing the tour order for the drivable path is
deliberate: it means "take the guided tour" becomes literally "drive the whole
road start to end," and free exploration (click any building from any other) is
"drive the sub-stretch of that same road between here and there" — one system,
not two.

```ts
// src/lib/road.ts (sketch)
function buildRoadCurve(waypoints: Vec3[]): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 0; i < waypoints.length - 1; i++) {
    path.add(new THREE.LineCurve3(toVector3(waypoints[i]), toVector3(waypoints[i + 1])));
  }
  return path;
}
// path.getPointAt(t) and path.getTangentAt(t) are then arc-length-correct
// across the whole route for free — no manual distance bookkeeping.
```

### 7.2 Curb points — where the car parks

Every attraction's parking spot is a **curb point**: by default, the nearest
point *on* `ROAD_PATH` to that attraction's `position`, computed once (a cheap
nearest-point-on-polyline scan at this small scale — a handful of buildings against
a few dozen line segments). An attraction may set an explicit `curbT` override
(§8) if the automatic nearest point puts the car somewhere that looks wrong (facing
the wrong way, or landing at an odd spot for a building set back from the street)
— same "compute a sensible default, override only when needed" philosophy as v1's
`computeDefaultShot`.

`CAR_EYE_HEIGHT = 2` (meters) — one fixed height above the road surface for every
stop; unlike v1, individual buildings no longer get a custom camera *position*,
only a custom look *target* (§7.3 phase 2).

### 7.3 The two-phase system — drive, then look up

```ts
// src/lib/camera.ts (sketch — replaces flyTo()/computeDefaultShot())

// PHASE 1 — DRIVE. Bypasses CameraControls entirely: writes camera.position/
// lookAt directly, every frame, for the duration of the drive.
//
// Why not route this through CameraControls.setLookAt() every frame: that API
// is built for occasional discrete calls with its own damped-velocity easing —
// driving it every frame fights that internal state and can leave a stale
// velocity that jerks visibly once a *real* transition (phase 2) starts later.
// Direct camera writes sidestep this; CameraControls sits inert during phase 1.
function stepDrive(camera: THREE.PerspectiveCamera, road: THREE.CurvePath<THREE.Vector3>, t: number, direction: 1 | -1) {
  const p = road.getPointAt(t);
  camera.position.set(p.x, p.y + CAR_EYE_HEIGHT, p.z);
  const lookAheadT = clamp(t + 0.02 * direction, 0, 1);
  const ahead = road.getPointAt(lookAheadT);
  camera.lookAt(ahead.x, ahead.y + CAR_EYE_HEIGHT, ahead.z);
}

// PHASE 2 — ARRIVE. Hands off to CameraControls for a damped tilt.
function arriveAndTilt(controls: CameraControls, camera: THREE.PerspectiveCamera, attraction: Attraction) {
  // Step 1: SYNC — seed CameraControls' internal state to match wherever
  // phase 1 actually left the camera, with no transition. Skipping this is
  // the #1 way to get a visible jerk: CameraControls would otherwise animate
  // FROM whatever pose it last remembered (e.g. the previous stop), ignoring
  // where phase 1 really parked the car.
  controls.setLookAt(
    camera.position.x, camera.position.y, camera.position.z,
    /* current look target, from the last stepDrive call */ ...currentTarget,
    false, // no transition — this call only synchronizes state
  );
  // Step 2: TILT — a damped transition that changes ONLY the target's height,
  // not the camera's position. This is "pan up once you arrive": taller
  // buildings (bigger `height`) tilt further, from the same formula every
  // time — no more per-building hand-tuned camera overrides (v1's DECA
  // special-case is gone; height replaces footprint, see §8).
  const [bx, by, bz] = attraction.position;
  controls.setLookAt(
    camera.position.x, camera.position.y, camera.position.z, // unchanged
    bx, by + attraction.height * 0.6, bz,
    true, // enableTransition — this is the visible "look up" pan
  );
}
```

`prefers-reduced-motion`: skip phase 1 entirely (place the camera directly at the
destination curb point, no animated drive) and pass `false` for phase 2's tilt
(instant, no pan). Deep links / initial load follow the same "snap, don't
animate" rule v1 used for its first camera move.

### 7.4 No more free aerial overview

v1's `OVERVIEW_SHOT` (an elevated view of the whole city) is **retired**. "Back to
city" now drives to the Welcome Plaza's curb point — the Plaza *is* the home
state (§3, §4.3). `AccessibleNav` (always-present, real links, §10) remains the
guaranteed way to reach any stop directly regardless of where the car currently
is — it matters even more now that there's no bird's-eye view to visually scan
and click around in.

### 7.5 Scope simplification, stated explicitly

The visual road network is a small **grid** (Main Street + cross streets, §4.1)
for downtown authenticity, but the **drivable** `ROAD_PATH` is one fixed
continuous route threaded through that grid, not a real pathfinding graph — going
from stop A to stop B always drives the specific stretch of `ROAD_PATH` between
their two curb points (potentially passing *by* other stops along the way,
without stopping — like an actual drive through downtown), never a shortest-path
search across the visual grid's cross streets. This is a deliberate simplification
(§2 non-goals) — revisit only if a future request specifically wants the car to
visibly choose between streets.

### 7.6 Hotspots

Unchanged from v1 (§7.4 there): a floating `<Html>` marker per attraction, a real
DOM `<button>`, idle bob animation, `AccessibleNav` as the guaranteed-reachable
parallel path. The only difference is what clicking one does — drives there
(§7.3) instead of flying there.

## 8. Data Model

Single source of truth is still `src/content/attractions.ts`, plus a new
`src/content/road.ts` and a new lightweight filler-building list. Adding an entry
to any of these is still the entire content change for that kind of addition.

```ts
// src/types/attraction.ts — CHANGED from v1
export type District = 'foundry' | 'lakeside' | 'plaza';
export type Vec3 = [number, number, number];

export interface TimelineEntry {
  role: string;
  dateRange: string;
  description: string;
}

export interface Attraction {
  id: string;
  district: District;
  name: string;
  subtitle: string;
  position: Vec3;
  height: number;          // NEW — meters, post-scale. Drives the arrival tilt
                             // (§7.3). Replaces v1's `footprint`.
  curbT?: number;           // NEW — optional override: 0..1 progress along
                             // ROAD_PATH where the car parks. Default: nearest
                             // point on the road to `position` (§7.2).
  rotationY?: number;
  scale?: number;
  model?: string;
  timeline?: TimelineEntry[];
  description?: string;
  facts?: string[];
  tags: string[];
  accentColor: 'foundry' | 'lakeside';
  // REMOVED from v1: `footprint` (replaced by `height`), `cameraShot` (replaced
  // by the uniform tilt formula in §7.3 — no more per-building camera overrides)
}

// NEW — purely decorative, no content, no hotspot, no route entry.
export interface FillerBuilding {
  model: string;
  position: Vec3;
  rotationY?: number;
  scale?: number;
}
```

```ts
// src/content/road.ts — NEW
export const ROAD_PATH: Vec3[] = [
  // ordered waypoints tracing the visual road tiles, in tour order (§7.1) —
  // exact coordinates are implementation-time visual-iteration work, same as
  // v1's exact camera numbers were; this file's shape is the deliverable here,
  // not a specific set of numbers.
];
```

```ts
// src/content/filler-buildings.ts — NEW
export const FILLER_BUILDINGS: FillerBuilding[] = [
  // ~18–24 entries for the Foundry District downtown (§4.1), each just a model
  // path + position + optional rotation/scale — no id, no district, no content.
];
```

**Migration note for existing `attractions.ts` entries**: every attraction needs
`footprint` renamed/replaced with a real `height` value (measure or estimate the
model's post-scale height — the same `scripts/inspect-bbox.mjs`/
`inspect-compressed.mjs` tools from v1 give this directly), and any `cameraShot`
override deleted (DECA's v1 hand-tuned override is exactly what §7.3's uniform
tilt formula replaces — verify DECA specifically once this lands, since it was
the one case v1 needed a manual override for).

## 9. Component Architecture

Additions and changes only — everything not listed here is unchanged from v1 §9.

```
src/
  lib/
    road.ts                 NEW — buildRoadCurve(), nearestPointOnPath()
    camera.ts                 REWRITTEN — stepDrive() (phase 1), arriveAndTilt() (phase 2); computeDefaultShot()/flyTo() removed
  content/
    road.ts                  NEW — ROAD_PATH waypoints (§8)
    filler-buildings.ts       NEW — FILLER_BUILDINGS list (§8)
  components/
    scene/
      CameraRig.tsx            REWRITTEN — two-phase drive/tilt state machine instead of a single setLookAt call
      RoadNetwork.tsx          NEW — visual road tiles: Main Street + Foundry cross streets (§4.1, §7.5), separate from the invisible drivable ROAD_PATH
      FillerBuildings.tsx      NEW — maps FILLER_BUILDINGS to <Building>; no hotspot, no click handler, no InfoPanel wiring
      Forest.tsx                NEW — drei <Instances> tree belt (§4.2)
      Plaza.tsx                 NEW — gate/arch kitbash + paving + props at the road's Plaza waypoint (§4.3)
```

`CameraRig.tsx` remains the only component that touches `CameraControls`
directly (unchanged principle from v1) — it now also owns the phase-1 direct
camera writes, so it's the only place both camera systems (manual + damped) ever
touch the same `camera` object, which is exactly why the phase hand-off (§7.3's
sync-then-transition) has to happen there and nowhere else.

## 10. Accessibility & SEO

**Unchanged from v1** — every point in the original §10 still applies verbatim:
canvas stays `aria-hidden` (scoped to the actual `<canvas>` element, not a
wrapping div — see the project memory note on why that distinction matters),
`AccessibleNav` stays the guaranteed-reachable path, `prefers-reduced-motion`
still means "skip the animation, snap instead" (now applied to the drive/tilt
system per §7.3 instead of the old flight). One addition:

- **Filler buildings (§4.1, §8) must never appear in `AccessibleNav`, must never
  get a hotspot marker, and must never be focusable.** They're set dressing —
  treat any filler building that accidentally becomes reachable/announced as a
  bug, not a feature; the whole point is that they carry no content.

## 11. Responsive / Mobile

**Unchanged from v1** — the `<768px` breakpoint, dpr cap, `PerformanceMonitor`
quality ladder, mobile shadow-resolution cap, and full-screen mobile `InfoPanel`
all carry over as-is. The drive animation (§7.3) should be checked at mobile
viewport sizes same as everything else, but there's no new mobile-specific
behavior beyond what §11 already specified.

## 12. Performance Budget

Numbers updated for the added density; the *policy* (measure, don't guess) is
unchanged from v1.

- Total scene triangle count: bump target to **< 350k** (was 200k) — ~20+ more
  filler buildings and a denser road network, still comfortably achievable with
  low-poly Kenney assets.
- **Instancing is now load-bearing, not optional**: without `<Instances>` for the
  forest (§4.2), 150–300 individual draw calls for trees alone would hurt frame
  rate on mobile. This isn't an optimization to consider later if things feel
  slow — build the forest instanced from the start.
- Total 3D asset payload: still comfortably **< 10MB** (v1 landed at 636KB) —
  filler buildings reuse already-downloaded pack models (~15–20 new small GLBs,
  estimate +500KB–1MB), forest trees are instanced (no new downloads at all, just
  more draw-time copies of the 3 existing tree models).
- FPS targets unchanged: 60fps desktop, ≥30fps mid-tier mobile (still enforced
  via `PerformanceMonitor`, §11) — re-verify after the density increase, don't
  assume v1's measurements still hold.
- Lighthouse targets unchanged: Accessibility ≥ 95, SEO ≥ 95 (v1 achieved 100 on
  both, mobile and desktop — re-run after this revision, don't assume it holds
  automatically).

## 13. Build Phases

Continues v1's phase numbering (v1 shipped through Phase 7). Each phase still
ends with the site in a working, deployable state.

**Phase 8 — Road system core (highest technical risk — build first, prove it on
the existing attraction set before touching layout/content)**
Author `ROAD_PATH` waypoints tracing a first-pass version of the road (doesn't
need the full downtown grid yet), build `lib/road.ts` (`buildRoadCurve`,
`nearestPointOnPath`), rewrite `CameraRig.tsx` for the two-phase drive/tilt
system (§7.3). Validate against the *existing* v1 attraction set and world
layout first — this isolates the hardest new mechanic from the (also
substantial) layout changes in the phases below.

**Phase 9 — Downtown density**
Re-layout the Foundry District as Main Street + cross streets (§4.1), export
Draco-compressed variants of previously-unused Commercial-pack models, add
`filler-buildings.ts` with ~18–24 entries, build `FillerBuildings.tsx` and
`RoadNetwork.tsx`. Verify visual density from car-eye height, not from an aerial
screenshot — the whole point is how it looks from the driver's seat.

**Phase 10 — Forest backdrop**
Build `Forest.tsx` using drei `<Instances>` (§4.2, §12), replacing/supplementing
v1's sparse tree placements. Verify it reads as "full" at multiple points along
the drive, especially at the edges of each district.

**Phase 11 — Plaza redesign**
Kitbash the welcome arch/gate (extend `scripts/kitbash-workshop.mjs`'s approach),
add plaza paving and props (§4.3). This is also where `ROAD_PATH`'s Plaza
waypoint gets its final position, once the physical plaza layout is set.

**Phase 12 — Copy pass**
Convert every first-person string to third person per §5 — Welcome Plaza intro,
the four Lakeside blurbs, `WelcomeOverlay.tsx`'s tagline, `og:description`. Grep
for "flies"/"flight" in user-facing strings and swap to driving language (§5.3).

**Phase 13 — Re-QA & redeploy**
Full regression per the updated §14, redeploy. Don't assume any v1 QA result
(Lighthouse scores, FPS, camera framing) still holds after this much layout and
system change — re-measure everything, the same discipline v1's QA phase used.

## 14. QA Checklist

Everything in v1's §14 still applies; these are additions specific to v2.

- [ ] Driving between every pair of *adjacent-on-the-road* stops looks correct —
      no clipping through buildings, road props, or the plaza gate
- [ ] The arrival tilt looks reasonable at both extremes: the shortest building
      (Café) and the tallest (DECA's skyscraper) — same formula, sanity-check
      both ends of it
- [ ] No free aerial shot is reachable anywhere in the UI — confirm `OVERVIEW_SHOT`
      is actually removed from the code, not just unused
- [ ] The forest reads as "full"/enclosing from car-eye height at several points
      along the route, not just from directly overhead in a debug screenshot
- [ ] Filler buildings never show a hotspot marker, never appear in
      `AccessibleNav`, never respond to a click or a Tab stop
- [ ] All visitor-facing copy is third person — grep for stray "I ", "I've",
      "my ", "me " outside of code comments
- [ ] Instancing is confirmed in the actual renderer (check draw call count in
      devtools, not just "it looks dense enough")
- [ ] Total triangle count and asset payload re-measured against §12's updated
      budget, not assumed from v1's numbers

## 15. Deployment

**Unchanged from v1** — same repo, same Vercel project, same `vercel.json` SPA
rewrite (still required for deep links to survive a refresh).

## 16. Runbook — Adding to the City

Two different additions now, not one — keep them distinct.

### 16a. Adding a new Attraction (resume-linked, gets a panel)

Same shape as v1's runbook, two field changes:
1. Get a model (same Path A/Path B as v1 §16).
2. Pick a world `position`.
3. Add one entry to `attractions.ts`: id, district, name, subtitle, position,
   **`height`** (not `footprint` — measure via `inspect-bbox.mjs`/
   `inspect-compressed.mjs`), model path, tags, and description/facts/timeline.
   Leave `curbT` unset — let the nearest-point-on-road default handle it (§7.2).
4. Run locally, click it. If the parking spot or arrival tilt looks wrong, set an
   explicit `curbT` — this and `position`/`rotationY`/`scale`/`height` are the
   only fields that ever need hand-tuning.
5. Ship it.

### 16b. Adding a new Filler building (decorative only, no panel — new in v2)

Even simpler, since there's no content to write:
1. Pick a `.glb` from an already-downloaded Kenney pack (almost certainly City
   Kit Commercial for Foundry-district density) or export one that hasn't been
   used yet.
2. Pick a `position` along a downtown block (§4.1) — no district field, no id, no
   curb point, since it's never a destination.
3. Add one entry to `filler-buildings.ts`: `{ model, position, rotationY?, scale? }`.
4. Run locally, confirm it doesn't overlap a neighbor or block the road. Ship it.

## 17. Open Questions / Future Enhancements

- **Whether Lakeside should also get filler-building density** — the user only
  asked for the Foundry District; Lakeside staying sparser actually reads as
  correct (residential neighborhood vs. downtown), but flag this if a future
  request wants symmetry.
- **Whether §7.5's single-route simplification ever needs real pathfinding** —
  only revisit if a future request specifically wants the car to visibly choose
  between streets rather than following one fixed route through the grid.
- Exact `ROAD_PATH` waypoint coordinates and the downtown block layout are
  implementation-time visual-iteration work — this document specifies the
  system and the sequence, not final numbers, the same way v1 left exact camera
  positions to be tuned against the running scene rather than computed by hand.
- Carried over from v1, still open: Onshape → Blender → GLB pipeline for a
  genuinely custom flagship building beyond the Robotics Workshop kitbash; custom
  domain; sound design.
