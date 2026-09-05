# Vasnova City — Interactive City Resume
### Product & Technical Design Document (PRD)
Status: v1.2 — ready to build · Owner: Aarav Vaswani

> **Revision note (v1.2):** city renamed from the placeholder "Aaravville" to
> **Vasnova City** — `CITY_NAME` in `src/config.ts` (§6, §8) is now finalized, not a
> placeholder. No other content changed.
>
> **Revision note (v1.1):** v1.0 scoped this as a 2.5D isometric DOM scene. That's
> been superseded — this is now a **true 3D scene** (React Three Fiber / Three.js).
> Content map (§5) and the district/theme decisions are unchanged from v1.0; the
> rendering engine, camera system, and asset pipeline are rewritten below.

---

## 1. Overview

A single-page website that presents Aarav's resume as a small 3D city. The visitor
lands on an aerial establishing shot of the whole city, then clicks buildings
("attractions") to send the camera on a cinematic flight to them and reveal a
resume-style info panel. The city is split into two districts:

- **The Foundry District** — career/achievements (robotics, startup, school, clubs)
- **Lakeside** — personal (interests, personality)

connected by a central **Welcome Plaza** that holds Aarav's intro blurb and contact
info. This is a **curated, fixed-shot experience**, not an open world — the camera
never free-roams under user control; every navigation action is "click a thing →
camera flies there → panel opens." (No orbit/fly controls exposed to the visitor —
see §7 for why that's a deliberate choice, not a missing feature.)

City name, district names, and every color/copy value below are config, not
hardcoded — see [§6](#6-tech-stack) and [§8](#8-data-model). `CITY_NAME` in
`src/config.ts` is `"Vasnova City"`.

## 2. Goals & Non-Goals

**Goals**
- Feels like a small, polished game moment — real depth, real light and shadow,
  a camera that swoops and settles rather than a flat pan.
- Every fact from the resume is present verbatim or near-verbatim — nothing lost
  for the sake of style.
- A recruiter skimming on a phone in 30 seconds gets as much value as someone who
  explores every building — including on a device where WebGL fails (§10).
- Adding a new attraction later (new club, new interest) is a data-file edit plus
  dropping in a model file, not a re-architecture — this is an explicit, named
  workflow (§16).
- Ships as a real, deployable site in one build pass (§13 phases are sequential and
  each phase leaves the site in a working state).

**Non-Goals (v1)**
- No free-roam camera (WASD, orbit, drag) — clicking is the only navigation input.
- No backend/CMS — content lives in a typed TS file in the repo.
- No procedurally generated city — every building is a hand-placed, hand-picked
  asset; this is a small diorama, not an infinite city.
- No WebGPU migration, no custom shader work — stock Three.js/WebGL2 rendering is
  more than enough here and keeps the build simple (see §6).
- No sound design in v1 (flagged as a Phase 8 stretch item, §13).

## 3. Experience Flow

```
Landing (Welcome Overlay, DOM, sits above the canvas)
  "Vasnova City" title card + "Enter the City" button
        ↓
Aerial establishing shot (fixed camera position, city fits the viewport,
very slow idle orbit/drift disabled by default — camera holds still)
  Two districts + Welcome Plaza visible, each with floating hotspot markers
        ↓
Click a hotspot ──────────────► Camera flies to that building's defined shot
        ↓                              (drei CameraControls.setLookAt, ~1.4–2s,
  Info panel slides in (DOM)            eased — see §7.3)
  (resume content for that stop)       ↓
        ↓                        Breadcrumb updates: Vasnova City › District › Building
  Click "Back to city" ─────────► Camera flies back to the aerial shot
        ↓
  (repeat, any order, any number of times)

Optional: "Guided Tour" button on the Welcome Plaza — auto-advances through every
attraction in a sensible order with Next/Prev/Pause controls, reusing the same
camera system. Build in Phase 7 — cheap once flyTo() exists.
```

Deep links: each attraction gets a route (`/foundry/robotics-workshop`,
`/lakeside/cafe`, etc. — see §6). Landing on a deep link skips the welcome overlay
and the flight — camera snaps directly to that building's shot with its panel
already open. Makes every stop shareable/bookmarkable and gives crawlers real
per-page URLs (the 3D canvas itself is not crawlable — this is why deep links plus
the DOM fallback nav in §10 matter more here than they would on a flat site).

## 4. Visual & Art Direction — "Pacific NW Tech City"

**Palette**

| Role | Color | Hex |
|---|---|---|
| Sky (top) | soft overcast blue | `#B8D4E3` |
| Sky (bottom) | pale morning gold | `#F0E6D2` |
| Evergreen (trees/foliage) | deep pine | `#2D5843` |
| Moss accent | `#4A7856` |
| Mountain silhouette (backdrop) | fog slate | `#7C93A3` |
| Lake / water | `#3E7CA6` |
| Ground / paths | warm cloud white | `#F4F1EA` |
| Foundry District accent | electric teal | `#2EC4B6` |
| Lakeside District accent | warm terracotta | `#C97B4A` |
| Text / UI ink | near-black | `#1F2A24` |

Rationale unchanged from v1.0: cool teal marks the "tech/career" half, warm
terracotta marks "personal" — visitors learn the color coding within seconds, and
it doubles as each district's UI accent and, now, its light/fog tint in-scene.

**Backdrop**: a Cascade-style mountain silhouette, a two-stop sky (via drei's
`<Sky>` or a simple gradient skybox), and a stylized lake physically separating the
two districts (Bellevue/Lake Washington nod), crossed by one bridge/path near the
Welcome Plaza. Use `THREE.Fog` tinted toward the sky-bottom color to soften the
world's edges and hide any pop-in — a cheap trick that also reads as "misty PNW
morning."

**Typography** (DOM overlay only — not in the 3D scene): `Space Grotesk` (or
`Inter`) for UI/body text, `Fredoka` (or `Baloo 2`) for the city title and district
headers. Self-host the woff2 files rather than linking Google's CDN.

**Buildings**: real low-poly 3D models (GLB), not sprites — see §4.1.

### 4.1 Asset Sourcing (all CC0, no attribution required)

Primary source: **Kenney.nl** — these ship natively as low-poly 3D models in glTF
format (confirmed), not pre-rendered sprites, so they drop straight into a
React Three Fiber scene.

| Pack | URL | Use |
|---|---|---|
| City Kit (Commercial) | kenney.nl/assets/city-kit-commercial | Foundry District buildings — offices/shopfront shapes for Robotics Workshop, NEEMO HQ, Academic Hall |
| City Kit (Suburban) | kenney.nl/assets/city-kit-suburban | Lakeside buildings — house/cozy-structure shapes for Café, Arcade, etc. |
| City Kit (Roads) | kenney.nl/assets/city-kit-roads | Roads, the bridge connecting the two districts, paths |
| Building Kit | kenney.nl/assets/building-kit | Modular pieces to kitbash a custom hero building (e.g. the Robotics Workshop — give the flagship building the most bespoke silhouette) |
| Nature/foliage pack (verify at download time) | kenney.nl | Evergreen trees, rocks, foliage — City Kit packs are buildings/roads only, so this is a separate pull; confirm it's glTF-format 3D, not a 2D sprite pack, before using it |

**3D asset convention** (required for every model, including future custom ones —
this is what makes §16 a data-file-and-drop-a-file workflow instead of per-building
guesswork):
- Format: `.glb` (binary glTF — single file, easiest to drop in `/public`)
- Origin: model origin at the **base-center** of the footprint (so placing it at
  `y = 0` sits it correctly on the ground plane with no manual vertical offset)
- Scale: real-world-ish units, 1 unit = 1 meter, footprint roughly 4–10m per
  building (match against an already-placed building by eye in the dev scene)
- Keep polycount low (Kenney's packs already are) — see the budget in §12
- Run new models through **Draco compression** before adding to the repo
  (`gltf-pipeline -i model.glb -o model.glb -d`) — cuts file size significantly
  with no visible quality loss at this art style

**Path B — custom-modeled buildings (Onshape → GLB):** since Aarav already models
in Onshape, a flagship building (the Robotics Workshop is the obvious candidate) can
be genuinely custom instead of a Kenney kitbash. Onshape doesn't export glTF
directly, so the path is: export the part/assembly from Onshape as **STL**
(mesh, simplest) or **STEP** (precise CAD, more Blender cleanup) → import into
Blender → apply low-poly flat-shaded materials matching the Kenney palette →
export as `.glb`, following the same convention above (base-centered origin, ~1
unit = 1m, Draco-compressed). This is flagged as a Phase 8 stretch item (§13, §17),
not required for v1 — v1 ships fully on Kenney assets.

## 5. Content Map — Resume → City

All copy below is final, pre-written, ready to paste into `attractions.ts` (§8).
No placeholder text — every attraction ships with real content on day one.
**Unchanged from v1.0** — this section is rendering-engine-agnostic.

### 5.0 Welcome Plaza (hub, not inside either district)

> "I am a driven student interested in robotics, electronics, and business.
> Throughout the 2 years I've been in high school, I've been part of the Saints
> Robotics FRC team, mentored FLL teams, taken the most rigorous academic courseload
> available to me, and competed in business events. My ultimate goal is to have a
> positive impact on the world through innovation and entrepreneurship."

Contact: Bellevue, Washington · (425) 531-2273 · aarav.vaswani@gmail.com
Also hosts: "Download Résumé (PDF)" button and the "Guided Tour" entry point.

### 5.1 The Foundry District (career)

**1. Robotics Workshop** — flagship building, largest structure, Saints Robotics FRC
team. Rendered as a 3-stop internal timeline (most recent first):
- *Vice President* — Co-leading and managing an 80+ member team with a $40,000
  annual budget across mechanical, programming, and outreach sub-teams. Supporting
  strategic planning and team operations for the current competition season.
- *Control Systems Officer — Electrical (2025–2026)* — Responsible for the design,
  wiring, and maintenance of the robot's electrical control systems. Taught and
  managed 10+ members, working with one co-officer and other sub-teams.
- *Technician – Competition (2026–Present)* — Quick thinking and decision-making to
  fix the robot between matches — both mechanical and electrical — while managing
  team resources in real time.
- Tags: `Electronics` `Leadership` `Team Management` `Control Systems` `Budget ($40k)`

**2. NEEMO HQ** — small modern storefront/office.
- *Co-Founder* — Co-founded a business focused on long-range RFID tracking of parts
  within robotics workshops. Generated $1,000+ in revenue in the first month. In
  charge of product technical development.
- Tags: `Entrepreneurship` `RFID` `Hardware` `Product Development`

**3. Interlake High School — Academic Hall**
- IB Diploma Candidate, 2025–Present · GPA 4.0 / 4.0
- AP Exams: World History (5), Calculus AB (5), Physics C: Mechanics (5), United
  States History (5)
- IB Higher Level: Physics, Business Management, Analysis & Approaches
- Tags: `Academics` `IB Diploma` `4.0 GPA`

**4. Makers Club Workshop (3D Printing)**
- *Co-Founder & Officer, 2025–Present* — Co-founded a school club building a
  community around 3D design, 3D printing, and creative projects. Brought in roughly
  50% of the club's non-officer membership.
- Tags: `3D Printing` `CAD` `Community Building`

**5. DECA Business Center**
- *Competitor, 2025–Present* — Competes in entrepreneurship-focused business
  events; advanced to the State competition.
- Tags: `Business` `Entrepreneurship` `Competition`

**6. FLL Mentorship Center**
- *Mentor, 2024–2026* — Mentored 15+ younger students across two FIRST LEGO League
  teams, teaching fundamental engineering skills and practices. One team advanced to
  States, the other to the Greece Invitational.
- Tags: `Mentorship` `Volunteering` `Robotics Outreach`

**Skills** are not their own building — they render as a persistent tag strip
(Electronics · CAD/Onshape · 3D Printing/Additive Mfg.) pinned to the bottom of
every Foundry District panel, since they cut across multiple attractions rather
than belonging to one.

### 5.2 Lakeside (personal)

**1. The Café** — coffee, sushi, Indian food, enjoys cooking (self-rated: not great
at it).
> "Runs on coffee. Always down for sushi or Indian food, and enjoys cooking — even
> if the results are hit or miss."

**2. Arcade / Game Room** — video games, favorite is Minecraft.
> "Been playing video games for as long as I can remember — Minecraft is the
> all-time favorite."

**3. Sports Field** — plays a bit of everything recreationally.
> "Into pretty much any sport — not amazing at any one of them, but always up for
> playing."

**4. The Open Road** — driving.
> "Loves driving — any excuse to be behind the wheel."

**5. "More Coming Soon" lot** — an empty plot with a small under-construction sign
(a simple placeholder prop, not a full building model). Ships in v1 on purpose: it
(a) honestly reflects "will add more later" from the source material, and (b) is
the live worked example for the add-attraction runbook in §16.

## 6. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | Vite | fast dev server, zero-config TS/React |
| Framework | React 18 + TypeScript | component model fits "one component per attraction"; strong typing for the content schema |
| 3D renderer | **React Three Fiber** (`@react-three/fiber`) over Three.js | the standard declarative way to build a Three.js scene in React — one `<Building>` component per attraction, same mental model as the rest of the app |
| 3D helpers | **`@react-three/drei`** | `useGLTF` (model loading w/ Suspense), `CameraControls` (the fly-to system, §7.3), `Sky`/`Environment` (backdrop+lighting), `Instances` (repeated props like trees), `PerformanceMonitor` (adaptive quality) |
| Routing | React Router | per-attraction deep links (§3); `/foundry/:slug`, `/lakeside/:slug` |
| DOM/UI animation | Framer Motion | **UI overlay only** — info panel slide-in/out, welcome overlay fade, breadcrumb transitions. Camera movement is *not* Framer Motion — that's `CameraControls` inside the R3F canvas (§7.3). Two different jobs, two different tools. |
| Styling | Tailwind CSS | fast to keep the two district palettes consistent via config tokens, used for all DOM overlay UI |
| State | Zustand | tiny global store for camera target, current attraction, tour mode |
| Hosting | Vercel | zero-config deploys from the GitHub repo, instant preview URLs per PR |
| Fonts | Self-hosted woff2 (Space Grotesk, Fredoka) | no external render-blocking request |

Explicitly **not** using: a full game engine (Unity/Godot WebGL export — way more
than this needs and a much heavier download), WebGPU (still rolling out, WebGL2 via
Three.js is the safe default in 2026), or free-orbit camera controls (OrbitControls)
as the primary interaction — `CameraControls`' `setLookAt()` is used specifically
for scripted cinematic shots, not user-driven orbiting.

## 7. World, Scene & Camera System

### 7.1 World coordinates & placement

Ground plane is the X/Z plane, Y is up, 1 unit ≈ 1 meter (matches the asset
convention in §4.1). Buildings are placed by world position, not a formula-derived
grid — in 3D, "does this overlap the neighbor" is something you check visually in
the dev scene, not something worth over-engineering a grid system for. Keep a
simple mental layout though: Foundry District buildings cluster on one side of the
lake, Lakeside buildings on the other, Welcome Plaza at the bridge crossing.

```ts
// src/types/attraction.ts (relevant slice)
position: [number, number, number]; // world x, y, z — y is almost always 0
rotationY?: number;                  // radians, orient the model to face the camera shot
scale?: number;                      // per-model correction if a source pack's units differ
```

### 7.2 Scene setup

- `<Canvas>` (R3F root) with a `PerspectiveCamera` (not orthographic — a real
  perspective camera is what makes the "swoop down from an aerial shot into a
  close-up" flight actually read as 3D depth; an orthographic/isometric camera
  would look flatter and undercut the reason for choosing 3D over the earlier
  2.5D plan).
- Lighting: one `directionalLight` ("sun," PNW-morning-angled, casts soft shadows)
  + `hemisphereLight` for soft ambient fill (sky-color from above, ground-color
  from below) — cheap, reads as "overcast Pacific NW light" without needing a full
  HDRI. `<Environment preset="dawn">` (or similar drei preset) can be layered in
  for nicer material reflections if it doesn't blow the performance budget (§12) —
  treat as a polish-pass nice-to-have, not a blocker.
- `THREE.Fog` tinted toward the sky-bottom color (§4), distance-tuned so the world's
  edges dissolve rather than hard-cut.
- Repeated props (trees, streetlights, benches) rendered via drei's `<Instances>`
  to keep draw calls down (§12) rather than one mesh per tree.

### 7.3 Camera — the "fly to" system

Use drei's `<CameraControls>` (wraps `yomotsu/camera-controls`), which has a
built-in smooth-transition `setLookAt()` — exactly the "scripted cinematic shot"
primitive this needs, and specifically *not* the free-orbit interaction pattern
most camera-control libraries default to (orbit/zoom/pan stay disabled for the
visitor — every camera move in this app is code-triggered, never drag-triggered).

```ts
// src/lib/camera.ts (sketch)
function flyTo(controls: CameraControls, shot: CameraShot) {
  const [px, py, pz] = shot.cameraPosition;
  const [tx, ty, tz] = shot.cameraTarget;
  controls.setLookAt(px, py, pz, tx, ty, tz, true /* enableTransition */);
}
```

Tune `controls.smoothTime` (overall settle speed) and `.restThreshold` (when the
transition is considered "arrived," which is what triggers the info panel to open)
once for the whole app rather than per-shot — consistency matters more than
per-building customization here.

**Where each shot's numbers come from** — don't hand-place every building's camera
by trial and error. Compute a sensible default, override only when a shot needs
art direction:

```ts
// src/lib/camera.ts
function computeDefaultShot(position: Vec3, footprint = 6): CameraShot {
  const [x, , z] = position;
  const distance = footprint * 2.2;
  return {
    cameraPosition: [x + distance * 0.6, distance * 0.55, z + distance * 0.8],
    cameraTarget: [x, footprint * 0.35, z],
  };
}
```

Every `Attraction` may set `cameraPosition`/`cameraTarget` explicitly (§8) to
override this default — use that for the Robotics Workshop and any other
flagship stop that deserves a hand-art-directed shot; leave it unset everywhere
else and let the default carry it.

**Overview shot** is one more `CameraShot`, defined once in `config.ts`, framed to
fit the whole city — `flyTo` back to it is the same function as flying to any
building.

**`prefers-reduced-motion`**: if set, call `setLookAt(..., false)` (transition
disabled — instant cut) instead of `true`. Same principle as the original 2D plan,
same reason: don't force motion on visitors who've asked their OS not to.

### 7.4 Hotspots

Attractions are marked with a small floating 3D marker (a simple billboard sprite
or drei `<Html>` badge anchored to the building's world position) with an idle
bob/glow, **plus** a real DOM `<button>` in the accessible nav (§10) that triggers
the exact same `flyTo` — the in-scene marker is a visual affordance, not the only
way to trigger navigation, since canvas content isn't independently focusable/
screen-reader-reachable.

## 8. Data Model

Single source of truth: `src/content/attractions.ts`. Every other part of the app
(hotspots, panels, breadcrumb, routes, tour order, accessible nav) is generated
from this array — adding an entry is the entire content change.

```ts
// src/types/attraction.ts
export type District = 'foundry' | 'lakeside' | 'plaza';
export type Vec3 = [number, number, number];

export interface TimelineEntry {
  role: string;
  dateRange: string;
  description: string;
}

export interface CameraShot {
  cameraPosition: Vec3;
  cameraTarget: Vec3;
}

export interface Attraction {
  id: string;              // slug, used in the URL: /foundry/robotics-workshop
  district: District;
  name: string;             // "Robotics Workshop"
  subtitle: string;         // "Saints Robotics — FRC Team"
  position: Vec3;           // world placement, y is almost always 0
  rotationY?: number;
  scale?: number;
  model: string;            // path to .glb under /public/assets/models/
  cameraShot?: CameraShot;  // override computeDefaultShot() — use for flagship stops
  timeline?: TimelineEntry[]; // for multi-role stops (Robotics Workshop)
  description?: string;     // for single-blurb stops (NEEMO, interests)
  facts?: string[];         // freeform bullets (GPA, AP scores, etc.)
  tags: string[];
  accentColor: 'foundry' | 'lakeside';
}
```

The full content from §5, already in this shape (minus the 3D-specific fields,
which get filled in during Phase 1/3 as models are placed), belongs in
`src/content/attractions.ts` verbatim — that file is the deliverable of Phase 3
(§13), not something to redesign; the copy is final.

## 9. Component Architecture

```
resume-city/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.ts
  PRD.md
  README.md
  public/
    assets/
      models/                 one .glb per attraction + shared props (trees, road, bridge, lot sign), filenames = attraction id / prop name
    resume-aarav-vaswani.pdf
    og-image.png              static screenshot of the overview shot, for link previews
  src/
    main.tsx
    App.tsx                    routes + top-level layout (Canvas + DOM overlay siblings)
    config.ts                   CITY_NAME, overview CameraShot, timing constants, palette tokens
    content/
      attractions.ts            §8 data — SOURCE OF TRUTH
      districts.ts                district metadata (name, accent, blurb)
    types/
      attraction.ts
    lib/
      camera.ts                  flyTo(), computeDefaultShot()
      webgl.ts                    WebGL2 support + context-loss detection (§10)
    store/
      useCityStore.ts             zustand: activeAttractionId, tourMode, webglSupported
    components/
      scene/
        CityCanvas.tsx            <Canvas> root, camera, lighting, fog, controls ref
        Building.tsx               useGLTF loader + placement + hotspot marker for one attraction
        Ground.tsx                  terrain, lake, bridge
        Props.tsx                   instanced trees/streetlights/etc.
      ui/
        WelcomeOverlay.tsx          title card, "Enter the City" CTA
        InfoPanel.tsx                slide-in resume content for active attraction (plain DOM, not in-canvas)
        Breadcrumb.tsx               Vasnova City › District › Building, each level clickable
        TourControls.tsx             guided tour Play/Next/Prev/Exit (Phase 7)
        AccessibleNav.tsx            always-in-DOM semantic list of every stop (§10) — also the non-visual trigger for flyTo
        NoWebGLFallback.tsx          static fallback view (§10)
        DownloadResumeButton.tsx
      layout/
        Header.tsx
        Footer.tsx
    hooks/
      useReducedMotion.ts
      useIsMobile.ts
    styles/
      globals.css
```

`CityCanvas.tsx` is the only component that touches `CameraControls` directly;
everything else reads `activeAttractionId` from the store and calls `flyTo()` —
keep it that way so there's one place that can get the 3D math wrong.

## 10. Accessibility & SEO

A `<canvas>` has **no semantic content at all** — this matters more here than it
did in the DOM-based v1.0 plan. Screen readers and crawlers cannot see anything
inside the 3D scene, full stop. Treat the canvas as pure decoration sitting behind
real, independent DOM content, not as a progressive enhancement of it.

- **`AccessibleNav.tsx`**: a real, always-present list (visually available, not
  just screen-reader-only) of every district and attraction, each a real link/
  button to that attraction's deep-link route. This is not a fallback bolted on
  at the end — it's the thing that makes the site actually reachable, so build it
  in the same phase as the routing (Phase 4, not deferred to a later "a11y pass").
- **`aria-hidden="true"` on the `<canvas>` element itself** — screen readers should
  skip it entirely rather than announcing an unlabeled graphic.
- **Real DOM text, never canvas-drawn/texture-baked text.** All resume copy (§5)
  lives in normal HTML inside `InfoPanel.tsx`.
- **Keyboard**: every accessible-nav entry is a `<button>`/`<a>`; `Escape` closes
  the panel and flies back to the overview shot; visible `:focus-visible` rings in
  the active district's accent color.
- **`prefers-reduced-motion`**: honored per §7.3.
- **No WebGL support / context lost → `NoWebGLFallback.tsx`.** Detect WebGL2
  support on mount (`webgl.ts`); listen for the `webglcontextlost` event on the
  canvas. Either case renders a static fallback: the `og-image.png` overview
  screenshot, the full `AccessibleNav` list, and the PDF download — the resume is
  never unreachable because a GPU/driver/browser combination didn't cooperate.
- **Color contrast**: verify all panel text against its background at WCAG AA
  (4.5:1 body text).
- **Download path**: `resume-aarav-vaswani.pdf` linked from the header/Welcome
  Plaza at all times regardless of whether the 3D scene loaded.
- **SEO/sharing**: per-attraction routes (§3) are real pages content-wise (the
  `AccessibleNav`/`InfoPanel` DOM content is present in the initial render, not
  injected only after a 3D flight finishes) — set `<title>`/meta description per
  route, and the static `og-image.png` for link previews.

## 11. Responsive / Mobile

- Breakpoint: `< 768px` = mobile behavior.
- Cap `devicePixelRatio` at 2 in the `<Canvas>` `dpr` prop — full native pixel
  ratio on a high-end phone is wasted GPU work at this art scale.
- Use drei's `<PerformanceMonitor>` to detect sustained low FPS and drop quality
  tier automatically: disable shadows first, then reduce `dpr` to 1, before ever
  touching content/layout.
- Shadow map resolution: capped lower on mobile from the start, not just as a
  PerformanceMonitor reaction — no point starting high and stepping down every time.
- `InfoPanel` becomes a full-screen sheet on mobile instead of a side card.
- Touch targets in `AccessibleNav` and any DOM hotspot buttons: minimum 44×44px
  hit area.
- No free pinch/drag camera control on any screen size, mobile or desktop — same
  reasoning as §2's non-goal: navigation stays click/tap-to-fly everywhere.

## 12. Performance Budget

- Total scene triangle count: < 200k for v1's ~12–15 buildings + instanced props
  (Kenney's kits are low-poly by design — this should be comfortable).
- Draw calls: keep low via `<Instances>` for repeated props (§7.2) and by not
  over-splitting materials on custom/kitbashed models.
- All `.glb` models Draco-compressed (§4.1) before committing to the repo.
- Total 3D asset payload (compressed): < 10MB for v1 — higher than a 2D-sprite
  budget would be, and that's expected; this is the real cost of "true 3D," traded
  deliberately for the depth/lighting/camera-move payoff.
- FPS targets: 60fps on a recent desktop/laptop, ≥30fps sustained on a mid-tier
  phone (enforced adaptively via `<PerformanceMonitor>`, §11).
- Lighthouse targets (these measure the DOM shell, not the WebGL canvas — still
  meaningful for load time/SEO/a11y of everything in §10): Accessibility ≥ 95,
  SEO ≥ 95, both mobile and desktop presets. No fixed Performance-score target
  given WebGL's cost profile is different from a DOM-only score — judge that one
  by the FPS targets above instead.

## 13. Build Phases

Each phase ends with the site in a working, deployable state — this is the
sequential build order for a single pass.

**Phase 0 — Scaffold**
`npm create vite@latest` (react-ts template). Install Tailwind, `three`,
`@react-three/fiber`, `@react-three/drei`, Framer Motion, React Router, Zustand.
Set up `config.ts`, folder structure from §9, empty `attractions.ts` with the §8
types. Get a bare `<Canvas>` with a spinning test cube deployed to Vercel first —
confirms the whole pipeline (including that Vercel serves `.glb`/binary assets
correctly) before building anything real.

**Phase 1 — Static scene**
Download Kenney packs (§4.1), place ground/lake/bridge (`Ground.tsx`) and 2–3
sample buildings at hand-picked `position`s, no camera system or interactivity
yet. Confirm lighting/fog/art direction (§4, §7.2) reads correctly at this
point — cheapest point to course-correct the visual style, same principle as
v1.0's Phase 1.

**Phase 2 — Camera system**
Implement `camera.ts` (`flyTo`, `computeDefaultShot`), wire `CameraControls`,
hotspot buttons, overview shot, "back to city" — placeholder panels only, confirm
the flight timing/easing/framing feels right before writing real content.

**Phase 3 — Full content**
Populate `attractions.ts` with all of §5 verbatim, place every remaining building
model (Draco-compressed per §4.1), build out `InfoPanel.tsx` to render
timelines/descriptions/facts/tags per the data model. At the end of this phase
every real resume fact from the source resume is on the site.

**Phase 4 — Routing & accessible nav**
Wire React Router, per-attraction routes, `AccessibleNav.tsx`, `aria-hidden` on
the canvas, `Breadcrumb.tsx`, deep-link-on-load behavior (§3). Build this
alongside routing, not after — see §10's note on why.

**Phase 5 — Welcome overlay & polish pass**
`WelcomeOverlay.tsx`, idle hotspot marker animation, transitions between UI
states, district color theming on panels, `<Environment>` polish if the budget
allows (§7.2, §12).

**Phase 6 — Robustness pass**
`NoWebGLFallback.tsx` + context-loss handling (§10), `<PerformanceMonitor>`
wiring + mobile quality tiers (§11), `prefers-reduced-motion` throughout,
Lighthouse checks against §12, keyboard-only full run-through, screen reader spot
check (VoiceOver is built into macOS — run it), real mid-tier-phone FPS check.

**Phase 7 — Guided tour (stretch, cheap once flyTo exists)**
`TourControls.tsx`, a defined tour order (probably: Welcome Plaza → Robotics
Workshop → NEEMO → Academic Hall → Makers Club → DECA → FLL → Café → Arcade →
Sports Field → Open Road), Play/Next/Prev/Exit.

**Phase 8 — Future/explicitly deferred**
Sound design, analytics, custom domain, Onshape → GLB pipeline for a genuinely
custom flagship building (§4.1 Path B).

## 14. QA Checklist (before calling it done)

- [ ] Every attraction's camera shot centers the building with room for the panel
- [ ] Every fact from the source resume appears somewhere on the site (diff §5 against the live content)
- [ ] Keyboard-only pass via `AccessibleNav`: reach and open every attraction, `Escape` returns to overview
- [ ] `prefers-reduced-motion` on: no camera tweens, instant cuts, still fully usable
- [ ] VoiceOver pass confirms the canvas is skipped and the nav/panel content is announced correctly
- [ ] Forced-WebGL-unsupported test (e.g. via browser flag or a temporary throw in `webgl.ts`) shows `NoWebGLFallback` correctly, with working PDF link and nav
- [ ] Mobile viewport (375px) and desktop (1440px+) both checked; real FPS check on a mid-tier phone, not just simulator
- [ ] All deep-link URLs load directly (not just via in-app navigation) with the correct panel open
- [ ] PDF download link works
- [ ] No console errors/warnings in Chrome, Safari, Firefox
- [ ] Total compressed asset payload measured against the §12 budget

## 15. Deployment

- GitHub repo (public — the code itself is also a portfolio signal), pushed from
  `~/Developer/resume-city`.
- Vercel project linked to the repo, auto-deploy on push to `main`, PR preview
  deploys on branches. Confirm Vercel's default headers don't mis-serve `.glb`
  files (binary, needs correct `Content-Type`) — check this in Phase 0, not after
  everything's built.
- Custom domain: optional, not required for v1.

## 16. Runbook — Adding a New Attraction

This is the reusable process, not a one-time step. Follow it every time (a new
club, a new interest, replacing the "More Coming Soon" lot).

1. **Get a model.** Either:
   - **Path A (fast):** pick a `.glb` from an already-downloaded Kenney pack
     (§4.1), or
   - **Path B (custom):** model it in Onshape, export STL/STEP, bring into Blender,
     match the Kenney art style, export `.glb` (§4.1 Path B).
   Either way, run it through Draco compression and confirm it follows the
   convention (base-centered origin, ~1 unit = 1m). Drop it in
   `public/assets/models/<new-id>.glb`.
2. **Pick a world position.** Run the dev server, look at the current layout,
   choose an unused `[x, 0, z]` in the correct district's cluster with enough
   clearance from neighbors — check by eye in the running scene, not on paper.
3. **Add one entry to `src/content/attractions.ts`** matching the `Attraction`
   type (§8): id, district, name, subtitle, position, model path, tags, and either
   a `description`, `facts`, or `timeline`. Leave `cameraShot` unset — let
   `computeDefaultShot()` handle it (§7.3). Nothing else in the codebase needs to
   change — the scene renders every entry automatically, the hotspot, route,
   breadcrumb entry, accessible-nav entry, and tour-order slot (if using Phase 7)
   all derive from this same array.
4. **Run locally, click it.** Confirm the model sits correctly on the ground and
   the default camera shot frames it reasonably. If the framing is off, set an
   explicit `cameraShot` override (§8) — this and `position`/`rotationY`/`scale`
   are the only fields that ever need hand-tuning.
5. **If replacing a placeholder** (e.g. the "More Coming Soon" lot), delete that
   entry from the array in the same commit rather than leaving dead content around.
6. **Ship it** — push to `main`, Vercel deploys automatically.

No other file needs to be touched for a standard addition. If a new attraction needs
a genuinely new interaction (not just model+copy), that's a scope decision, not
part of this runbook — flag it before building.

## 17. Open Questions / Future Enhancements

- ~~Final call on `CITY_NAME`~~ — resolved in v1.2: `"Vasnova City"`.
- More Lakeside interests are coming per the source material ("will add more
  later") — §16 is exactly the process for those when they arrive.
- Path B (Onshape → Blender → GLB) for a genuinely custom Robotics Workshop model
  is deferred to Phase 8, not blocking v1 — v1's Robotics Workshop is a Kenney
  Building-Kit kitbash.
- `<Environment>` HDRI polish (§7.2) — include only if it doesn't threaten the
  §12 performance budget on mobile; cut without hesitation if it does.
- Custom domain — deferred, not blocking.
- Sound design — deferred to Phase 8.
