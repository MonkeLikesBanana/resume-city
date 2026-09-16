# Vasnova City — Interactive City Resume
### Product & Technical Design Document (PRD)
Status: v7.0 — in progress · Owner: Aarav Vaswani

> **Revision note (v7.0, round 11):** a real, full-motion drive-through of
> the entire 12-stop tour (clicking Next repeatedly with actual drive
> animations playing, not deep-linking with reduced motion) — the one
> navigation path this round's testing hadn't directly exercised yet.
> Confirmed clean end to end, including the river/gate area at night and
> the full fenced suburb at both dusk and daylight (the day/night clock
> advanced naturally over the ~40-second drive). While auditing
> `DISTRICTS` lookups during this pass, found `DistrictMeta.accent` and
> `.blurb` are dead fields — grepped every call site and confirmed only
> `.name` is ever read. `.accent`'s type union even included `'plaza'`,
> implying `ACCENT_FILL`/`ACCENT_TEXT` should have a plaza entry — they
> never will, since the Welcome Plaza's real accent (used everywhere
> styling actually happens) is `'foundry'`. Removed both fields rather
> than leave unused data implying a design surface that doesn't exist.
>
> **Revision note (v7.0, round 10):** a full proofread of every résumé
> copy string in `attractions.ts` — description, subtitle, facts, and
> timeline text for all 12 stops — checked for typos, factual
> inconsistency, and typographic consistency (apostrophe style, dash
> usage). Found one real issue: Robotics Workshop's third timeline entry
> read `role: 'Technician – Competition'` (en dash) while its sibling
> entry two lines above reads `'Control Systems Officer — Electrical'`
> (em dash) — the identical "role — qualifier" pattern, inconsistently
> dashed. Every other en dash in the file is a correctly-used date range
> (`2025–2026`, etc.), confirmed by checking each one's context
> individually rather than assuming; this was the one genuine mismatch.
> Apostrophe usage checked separately and found consistent (plain ASCII
> throughout prose, matching the code's own string-literal style — not
> a mix of smart and straight quotes).
>
> **Revision note (v7.0, round 9):** checked `public/og-image.png` — the
> social-preview image shown in every link unfurl (Slack, iMessage,
> Twitter/X cards, etc.) — against the current deployed world rather than
> assuming a September 6th capture still represented it. It didn't: the
> old image showed a large dark-grey "smoke" cloud directly over downtown
> — the exact cloud-material bug fixed in rounds 3/8, meaning this image
> had been capturing that bug's visible symptom the whole time it was
> live — plus the pre-round-1 city (no river, no fenced yards, a visibly
> sparser suburb and forest). Regenerated at the standard 1200×630 OG
> size against the current deploy.
>
> **Revision note (v7.0, round 8):** a follow-up to round 7's fix, caught
> by re-verifying it with a full scrub sweep across the day/night cycle
> (not just the one screenshot that first exposed the plaza-gate-lamp
> bug) — a much fainter version of the same "dark shape" symptom was
> still visible, small dark blobs near the treeline during a dusk-
> transitioning sky, at a size/position matching two of `Clouds.tsx`'s
> three placements. Round 3's `MeshBasicMaterial` swap removed the
> scene's LIGHTS from darkening clouds but missed a second, independent
> path: `DayNightCycle.tsx` sets `scene.fog.color` to the sky's current
> horizon color every frame (dark navy at night, warm orange at dusk),
> and `MeshBasicMaterial.fog` defaults to `true` in three.js — so distant
> clouds still blended toward that color regardless of the lighting fix.
> Fixed with a small subclass (`UnlitCloudMaterial`) that sets
> `this.fog = false` in its own constructor, surviving drei's internal
> `class extends material` wrapping. Verified clean across a full scrub
> from daylight through dusk to full night this time, not a single
> screenshot.
>
> **Methodology note**: this is the second time in two rounds a fix
> verified against only ONE reproduction of a lighting-dependent bug
> turned out to be incomplete — round 7's proximity-query fix WAS fully
> correct for what it targeted (the gate lamps), but the original bug
> report actually had two independent causes bundled into one visual
> symptom, and fixing one silenced the loudest evidence of the other
> without eliminating it. **Lesson**: when a bug is lighting/time-of-day
> dependent, "the exact screenshot that reported it now looks clean" is
> necessary but not sufficient — sweep the full cycle before declaring it
> fixed, since a fainter residual can hide in exactly the range not
> re-checked.
>
> **Revision note (v7.0, round 7):** the resolution to a bug open since
> the very beginning of this PRD round — the "dark curved tentacle
> shapes" independently spotted in the original round-1 screenshot,
> before any of the explicit asks were even addressed. Round 3 found and
> fixed a real, separate cloud-material bug that PRODUCED a similar
> symptom at dusk/night, but re-testing at full daylight (while checking
> a cross-street closure placement, unrelated to clouds entirely) showed
> the exact same dark shapes in bright daylight — proving the cloud fix,
> while a legitimate bug in its own right, was never the actual cause of
> the originally-reported one.
>
> Root-caused this time with a scene-graph proximity query — a temporary
> `useThree()` hook exposing the live THREE.Scene/camera to `window`,
> queried from Playwright at the exact camera position that reproduced
> the shapes — rather than guessing again. The culprit: the Welcome
> Plaza's own 4 gate streetlamps (`PlazaSquare.tsx`) use `streetlamp.glb`,
> whose internal mesh is literally named "light-curved" — a thick, smooth,
> curved swan-neck arm, confirmed via a side-by-side isolated render
> against `light-square.glb` (a sharp right-angle arm, used by every other
> streetlamp in the city). At the ~3-4m lateral distance every streetlamp
> in the city sits from the road — an unavoidable, universal distance, not
> something unique to the gate — the curved arm's silhouette loses its
> "obviously a lamp" read and looms as a large dark curved shape;
> `light-square.glb`'s angular arm has passed this identical distance at
> hundreds of placements with zero reports. Swapped the gate lamps to
> match, eliminating a whole distinct model rather than trying to tune the
> curved one's scale/rotation to be safe from every possible camera angle.
>
> **Methodology note**: round 6.0's original investigation of this exact
> model (the gate-lamp *height* bug) measured bounding-box similarity
> between `streetlamp.glb` and `light-square.glb` and concluded they were
> safe to treat as interchangeable modulo scale — true for overall
> dimensions, false for silhouette/shape, which a bounding box cannot
> capture. **Lesson, worth remembering generally**: bbox comparison proves
> two models are the same SIZE, never that they're the same SHAPE — an
> actual rendered silhouette comparison is the only way to know that, and
> is worth doing whenever a model swap or reuse decision is being made
> "because the dimensions are close enough."
>
> **Revision note (v7.0, round 6):** continuing the same self-review —
> checked the far end of the Lakeside suburb (past every named attraction,
> right up against the outer treeline ring) for overlap risk given round
> 1's density increases, and found that area clean. But comparing that
> screenshot against an earlier Foundry one side by side surfaced a real,
> pre-existing (not introduced this round) UI inconsistency: TourBar's
> desktop "Next →" button was hardcoded to Foundry's teal accent color
> regardless of which district is active, while the breadcrumb tab,
> InfoPanel's left border, and the hotspot title pill all correctly switch
> to Lakeside's orange on a Lakeside stop — three pieces of chrome doing it
> right, one doing it wrong, all visible in the same frame. Fixed by
> reading the active attraction's own `accentColor` via `ACCENT_FILL`, the
> same pattern InfoPanel's mobile inline Next button (added round 4)
> already used correctly — TourBar's desktop version had just never been
> updated to match when accent-coding was first introduced.
>
> **Revision note (v7.0, round 5):** continuing the same self-review —
> zoomed into a close-up crop of a suburb yard's fence (round 1's own new
> feature) rather than trusting the wide establishing shots already
> checked, and found the panels floating above the ground at inconsistent
> tilted angles instead of forming a clean line. Root-caused with the
> project's established isolated-render technique (load the model alone,
> identity rotation, on a flat grid, no game code involved) rather than
> re-deriving rotation math from the wrong assumption: `fence-low.glb` is
> modeled as a leaning/knocked-over fence variant BY DESIGN — one end sits
> on the ground, the other floats well above it, confirmed by rendering it
> in isolation and seeing exactly that. Not a placement bug — a wrong
> model choice. `fence.glb` (internal mesh name "fence-1x2") is the
> correct flat straight panel; confirmed the same way, from directly
> overhead, before swapping it in and recalculating the panel-length
> constant from its real bounding box.
>
> **Methodology note**: this is the same lesson the project has now hit
> at least three times (the streetlamp scale bug in v6.0, the window-glow
> threshold miscalibration in v4.0, and now this) — when a visual defect
> can't be explained by the placement code's own math, isolate the asset
> and look at it directly rather than re-deriving the math a second or
> third time under a different guess. It's also a reminder that a wide
> establishing shot can hide a defect a close crop reveals immediately —
> worth deliberately cropping into small/detailed props during any future
> visual review, not just checking whether the overall scene looks right
> from a normal viewing distance.
>
> **Revision note (v7.0, round 4):** continuing the same self-review —
> this pass specifically checked a real mobile viewport (390×844) and a
> Lighthouse run, neither of which round 1-3's desktop-only screenshot
> sweeps had covered. Two more real findings:
> 1. **A mobile-only layout bug hiding two important controls.** InfoPanel
>    becomes a full-width bottom sheet on mobile (`inset-x-0 bottom-0`);
>    TourBar's floating Prev/Next pill and Header's résumé-download button
>    both sit at fixed positions that land inside that sheet's own
>    footprint, at the same z-index — confirmed by screenshotting a real
>    mobile width: TourBar rendered on top, visibly clipping the panel's
>    text, and the résumé button was hidden underneath entirely. Since an
>    attraction is essentially always active once the tour is entered
>    (§3/§8), this meant mobile visitors couldn't reach the résumé
>    download for the whole visit — not a rare edge case. Fixed by hiding
>    both floating bars below the `sm` breakpoint and giving InfoPanel its
>    own inline Prev/Next row + résumé link for mobile, laid out as part
>    of the panel's own content instead of a separately-fixed overlay
>    racing it. Desktop unaffected.
> 2. **A missing/malformed `llms.txt`.** A Lighthouse pass (run to confirm
>    the density changes hadn't regressed performance — they hadn't, see
>    the methodology note below) surfaced a new `agentic-browsing`
>    category flagging this. The SPA's catch-all route was serving
>    `index.html` for `/llms.txt` since no real file existed; added one
>    following llmstxt.org's convention (H1, summary, linked sections per
>    district) so any LLM-based crawler gets a direct, accurate map of
>    every stop instead of having to infer structure from the 3D scene.
>
> **Methodology note**: re-ran Lighthouse against the production build to
> check whether this round's density increases (denser forests/suburb,
> Yard.tsx's per-house fence instancing) regressed performance. First
> desktop run: 0.81 / 408ms TBT — alarming at a glance, but two immediate
> re-runs on the *identical unchanged build* came back 0.99 / ~15-20ms TBT,
> matching this project's own previously-documented "never trust a single
> Lighthouse reading" lesson yet again. Mobile-preset numbers (0.82,
> ~230ms TBT across two consistent runs) matched the historical v4.0 QA
> baseline (0.83) almost exactly — the instancing discipline held under
> real density growth, no regression.
>
> **Revision note (v7.0, round 3):** one more finding from the same
> self-review pass, caught while re-verifying round 2's camera fixes with a
> scrub sweep across the full day/night cycle rather than only checking
> static parked shots: the "dark curved tentacle shapes hanging in the sky"
> independently spotted in the user's original round-7 screenshot (never
> confirmed at the time — the first two reproduction attempts, checking a
> parked stop at night, didn't recreate it) turned out to be real, and
> reproduces reliably once tested the right way — mid-scrub, at dusk, not
> parked at full night. Root cause: drei's `<Cloud>` defaults to a LIT
> material (`MeshLambertMaterial`), so cloud puffs dim along with the
> scene's actual day/night light exactly like a building would — at dusk
> that renders as dark, oddly-shaped hanging silhouettes, exactly matching
> what was reported. Fixed with an unlit `MeshBasicMaterial` swap
> (`Clouds.tsx`) — clouds are a flat atmospheric decoration, not a
> physically-lit object, so they read the same soft off-white at any time
> of day now, the way real clouds stay visibly bright well into dusk.
>
> **Methodology note**: the lesson from this one is really about test
> coverage, not the bug itself — round 2's camera/streetlamp verification
> only checked static parked screenshots at default (noon) lighting, which
> is why this survived one whole round undetected despite already being
> under active investigation. Any future "something looks visually wrong"
> report tied to lighting/time-of-day needs a scrub across the actual cycle,
> not just a parked-stop spot check, before concluding a fix worked or a
> repro attempt failed.
>
> **Revision note (v7.0, round 2):** the first pass of the self-review the
> round-1 note below promised — driving the deployed tour stop by stop as
> a fresh visitor would, screenshotting every stop, and looking hard at
> each one rather than assuming round 1 shipped clean. Found three real
> issues, one of them severe:
> 1. **A whole-app crash, not a cosmetic bug.** `Clouds.tsx` used drei's
>    `<Cloud>` with its default `texture` prop — a hardcoded third-party
>    CDN URL. When that fetch fails for any visitor (network hiccup, CDN
>    outage, a corporate firewall blocking an unfamiliar host), three.js
>    throws, there was no error boundary anywhere in the tree, and the
>    ENTIRE React app unmounted to a blank white page — not just the sky
>    losing its clouds. Confirmed directly: reproduced the failure, saw
>    the blank page, read the stack. Fixed at the source with a small
>    self-generated, self-hosted cloud sprite (no external dependency at
>    all), and added an error boundary around the Canvas as defense in
>    depth — any future failure now degrades to the existing
>    `NoWebGLFallback` (full resume still reachable) instead of a silent
>    blank page.
> 2. **Two arrival shots didn't show their building.** Robotics Workshop
>    (11m) and DECA Business Center (13.4m) are real, intentionally tall
>    kitbashed towers — but every attraction parks at the same fixed ~9m
>    road standoff regardless of height, and at that distance neither
>    tower's silhouette fit in frame; the arrival shot was just a wall of
>    siding. Fixed by backing the camera further from unusually tall
>    buildings specifically (§7.3), left as a no-op for the other 10
>    attractions.
> 3. **A streetlamp landed 0.5m from a parked camera position** ("More
>    Coming Soon"), filling most of that stop's frame. Streetlamp
>    placement now skips any spot within 5m of a real attraction.
>
> New section: §7.9 (arrival standoff, this round). This is round 2 of the
> open-ended iteration from round 1's note — the loop continues: ship
> fixes, self-review the live deploy again from scratch, repeat.
>
> **Revision note (v7.0, round 1):** a denser-and-more-realistic pass, plus
> a standing directive to keep iterating autonomously afterward until an
> honest self-review turns up nothing left to fix. This round's asks:
> 1. **Denser but contextually sensible props** — construction cones/
>    barriers closing off both cross streets' dead ends (they never
>    connected through to anything — a real city would mark that), and a
>    denser bench pass specifically along the Lakeside street (suburb
>    only, not downtown — the ask was for the suburb to feel more lived-in,
>    not a uniform bump everywhere).
> 2. **Suburb ground still gray, not green** — root-caused this time, not
>    just re-widened: `Ground.tsx`'s `DOWNTOWN_GROUND` pavement rectangle
>    (sized for Foundry's own filler footprint) reached far enough east,
>    at a higher Y than the grass patch, to cover part of the suburb's own
>    west-row houses once they resume past the wedge exclusion zone
>    (z>50) — confirmed by computing the two rectangles' actual overlap,
>    not re-guessing at the grass patch's bounds a third time. Pulled
>    `DOWNTOWN_GROUND`'s z-extent back to match Foundry's real reach, and
>    (the real, durable fix) gave every house — generated filler and the
>    real Lakeside attractions alike — its own lawn plane via the new
>    `Yard.tsx`, rendered above every coarse ground rectangle so it can't
>    lose to whichever one happens to reach furthest next time either
>    district's footprint grows.
> 3. **A forest sat between Lakeside and Foundry** — unrealistic for two
>    built-up districts that close together. Replaced with an actual river
>    (`River.tsx`, a chain of overlapping water circles echoing Park.tsx's
>    pond), checked against every real building in that quadrant (NEEMO HQ,
>    the x=-26 cross street's road bed, DowntownPocketPark) so nothing
>    collides. This was the same fix as "remove the trees within the main
>    city area" — Forest.tsx's other regions were all already outside
>    every district's real footprint (checked directly, not assumed), so
>    the wedge was the only region that qualified.
> 4. **Outside forests much denser** — roughly doubled every genuine
>    outer-wilderness region's tree count, plus the outer treeline ring
>    (the mass of trees actually visible against the mountains from most
>    camera angles, so the highest-leverage place to add density).
> 5. **Suburb housing much denser, "like a real neighborhood"** — six rows
>    per side now (was four), every row's lot spacing tightened, not just
>    more rows added at the old spacing. Fenced-in lawns (`Yard.tsx`, see
>    #2) at the same time, for the same "real neighborhood" effect.
>
> New sections: §4.10 (Yard.tsx/River.tsx, this round). Every other section
> carries over unchanged. This is round 1 of an open-ended iteration — the
> standing goal after this round ships is an autonomous, exhaustive
> self-review of the deployed tour (every flaw, however small, judged as
> if seeing the site fresh) turned into a round 2 PRD, repeated until the
> review turns up nothing left worth fixing.
>
> **Revision note (v6.0):** v5.0 was declared MVP. Three more asks, plus the
> standing goal restated once more (make this as close to a real city as
> possible):
> 1. **There's still a large amount of open space** — explicitly *not* by
>    adding more buildings or forest density, but by putting real things in
>    the empty ground that's already there: parks, benches, the kind of
>    street furniture a real city block actually has.
> 2. **A lot of the smaller sprites are messed up/bugged** — investigated
>    directly rather than guessed at (a temporary isolated model-comparison
>    render of every small prop in the game, at each one's *real* in-game
>    scale, not a uniform test scale that would just recreate a fake
>    "some look huge" artifact). Found one clear, verifiable bug: the
>    Plaza gate's four `streetlamp.glb` fixtures were scaled to roughly
>    half the height of every other streetlamp in the city, despite the
>    underlying model being almost identically proportioned to the one
>    used everywhere else (`light-square.glb`) — confirmed via direct
>    model-dimension inspection, not eyeballing.
> 3. **A scrub bar for explore-yourself mode** — holding ←/→ (§7.5) had no
>    visual feedback and no way to jump straight to a stop without
>    physically scrubbing there first. A bottom bar, visible only while
>    actually scrubbing, showing every stop along the tour: drag it to
>    move through the city directly, or click a stop to jump straight to
>    its panel.
>
> §4 gets one more new subsection (§4.8) for the furniture/pocket-park
> work and the streetlamp fix; §7 gets one for the scrub bar (§7.8). Every
> other section carries over unchanged.
>
> **Revision note (v5.0):** three fixes reported from an actual screenshot of
> the deployed site (the fork/junction area), after several rounds of
> unversioned polish already shipped on top of v4.0. In the order given:
> 1. **A kit road model is still visibly wrong in the suburbs** — driveways
>    (`road-driveway-single.glb`) turned out to share the *exact same*
>    texture atlas as the road tiles already replaced in earlier polish
>    (confirmed by extracting it: byte-identical to road-side.glb's), so
>    every driveway still shows the busy, out-of-place kit pattern that
>    was fixed everywhere else. Replaced with a plain paved plane, the same
>    fix already applied to every other road surface.
> 2. **Ground flickers between green/road/gray at the fork** — a real
>    z-fighting bug, not a rendering artifact: the plaza pavement plane and
>    the road system's junction-fill plane sit at the *identical* height
>    (y=0.01) and spatially overlap by a few square meters, and separately
>    the suburb's grass patch and downtown's pavement patch sit at the
>    identical height (y=-0.03) and overlap too — confirmed by computing
>    both pairs' actual bounds, not guessed from the screenshot alone. Two
>    coincident opaque planes at the same height is exactly what causes
>    GPU-precision-dependent flicker. Root-caused a second, deeper issue
>    while tracing this: Foundry's north-side filler rows and the suburb's
>    west-side house rows both independently claim the same map quadrant
>    near the junction (each was generated without knowledge of the
>    other), so *building* placements can overlap there too, not just
>    ground planes — round 5's footprint expansion made this much more
>    likely to actually happen. Fixed both: every ground layer gets a
>    distinct height (deterministic occlusion instead of coincident
>    z-fighting), and a shared exclusion zone keeps each district's filler
>    out of the other's claimed corner, with the resulting gap filled by
>    extending the existing "neutral wedge" forest region rather than left
>    bare.
> 3. **Night lighting is all-or-nothing** — every streetlamp and every
>    glowing window turns on together at full brightness the moment the
>    day/night cycle crosses into night, which reads as a stage cue, not a
>    real city (some windows are always dark — nobody's home, the lights
>    are off, the shop is closed). Roughly a third of lights now stay off
>    on any given night cycle, and darkness itself isn't static either:
>    an off light has a small per-second chance to flicker briefly on
>    (a loose connection, a motion light) the same way an on light already
>    had a chance to flicker briefly off.
>
> Same overall goal restated once more, because it keeps being the right
> compass for prioritizing which of these to fix first: make this as close
> to a real city as possible.
>
> §4 is amended below with two new subsections (not fully rewritten — these
> are corrections to existing v4.0 systems, not new ones). Every other
> section carries over unchanged.
>
> **Revision note (v4.0):** major revision after seeing the v3.0 build. Five
> changes, in the order the user gave them, plus the same overall goal
> restated once more: make this as close to a real city as possible.
> 1. **Default guided tour, hidden titles** — building names shouldn't float
>    over everything all the time; they should only appear once you've
>    actually arrived at a place. The site should start in this guided mode
>    automatically, with the Welcome Plaza already selected, and "Next"
>    drives to the next stop along the roads.
> 2. **Fill the empty space** — the Welcome Plaza needs more decoration; the
>    suburb needs green grass and more greenery; downtown needs sidewalks,
>    streetlamps, stands, and everything else a real city block has, so there
>    is no empty ground where something would really be.
> 3. **Slower, smoother motion** — the speed and acceleration haven't
>    actually changed; make both slower so there's time to see the city.
> 4. **A real sky** — darker, a proper mountain range, drifting clouds,
>    working streetlamp/window lights that flicker occasionally, and a full
>    day/night cycle on a 1–2 minute loop.
> 5. **A manual "explore yourself" control** — hold the right arrow to move
>    forward along the tour path, left to go back, continuously, skipping
>    stops if held long enough rather than stopping at each one.
>
> §3, §4, §6, §7, §8, §9, §12, §13, §14, §17 are rewritten below. §1, §2,
> §5, §10, §11, §15, §16 are carried over with light edits.
>
> **Revision note (v3.0):** perpendicular districts at a road junction,
> single continuous drive+tilt camera controller, realistic road detail,
> downtown/suburb density, Lakeside suburb (park, basketball court) — built
> and shipped.
>
> **Revision note (v2.0):** downtown density, car-not-drone camera, forest
> backdrop, real entrance plaza, third-person copy — built and shipped.

---

## 1. Overview

A single-page website that presents Aarav's resume as a small 3D city,
explored the way a visitor would actually take a guided tour of one: the car
starts parked at the Welcome Plaza, and clicking "Next" drives it to the next
stop along the roads, one at a time, tilting up to frame each building on
arrival. Nothing about a building announces itself from a distance — no
floating name tag until the car has actually arrived and is looking at it —
because that's how visiting a real place works: you don't see a building's
name from three blocks away.

City name, district names, and every color/copy value below are config, not
hardcoded — see [§6](#6-tech-stack) and [§8](#8-data-model). `CITY_NAME` in
`src/config.ts` is `"Vasnova City"`.

## 2. Goals & Non-Goals

**Goals**
- Standing anywhere in the city, only the place you're actually at announces
  itself — no clutter of every other building's name floating in the
  distance, the same way a real street doesn't have name tags hovering over
  every storefront.
- The guided tour is the default, immediate experience — no extra click to
  "start" it; you arrive already on it, at the Welcome Plaza.
- Nowhere in the city has empty ground where a real city block or a real
  yard would have *something* — a sidewalk, a lamp, a fence, a patch of
  grass, a market awning.
- Driving feels like an actual car easing up to speed and slowing down, not
  a point jumping between an eased start and end pose — slow enough that the
  city is actually visible while moving through it.
- The sky is alive: it changes over time, has real depth (proper mountains,
  drifting clouds), and the city's own lights come on as it darkens.
- A visitor who wants to explore at their own pace, not stop-by-stop, can
  hold a key and glide the whole route themselves.

**Non-Goals (v4)**
- Still no manual drive/orbit/WASD free camera — "explore yourself" (§7.5)
  moves along the *same fixed tour path* forward and backward, it doesn't
  let the car leave the road or turn away from it.
- No true multi-route pathfinding — unchanged from v3 (§7.5 there); the tour
  order defines the one path everything (Next/Prev, direct jumps, the
  explore-yourself scrub) travels along.
- No new asset packs — everything in §4's decoration pass and §7.4's
  atmosphere reuses pieces from the five Kenney packs already on disk (§4.5)
  plus drei's built-in `<Cloud>` component (already a transitive dependency
  of `@react-three/drei`, no new install).
- Real-time shadow-casting for every streetlamp/window light: out of scope
  for perf reasons (§12) — these are unshadowed point lights / emissive
  glow, not full dynamic shadow casters. The one shadow-casting light
  remains the sun, same as v1–v3.

## 3. Experience Flow

```
Landing (Welcome Overlay, DOM, sits above the canvas)
  "Vasnova City" title card + "Enter the City" button
        ↓
Car is already parked at the Welcome Plaza, the Plaza is already the
selected/active stop (its info panel is already open, its title is already
showing) — this is tour position 0, not a neutral "home" state you have to
leave. There is exactly one marker visible: the Plaza's own. Every other
building in view is unlabeled.
        ↓
Click "Next →" (always-visible bottom bar, §7.6) ──►
  The car drives from wherever it's parked to the next stop in tour order,
  along the roads (through the junction corner if the leg crosses
  districts, §7.1 — unchanged from v3), accelerating up to a comfortable
  cruising speed and easing back down on arrival (§7.2 — genuinely slower
  and smoother than v3, not just re-labeled the same speed). On arrival, that
  stop's title appears and its panel opens; every other title stays hidden.
        ↓
  Click "← Prev" to go back a stop, the same way. AccessibleNav / breadcrumb
  links still jump straight to any stop directly (§10, unchanged
  accessibility guarantee) — doing so also updates "Next"/"Prev" to continue
  correctly from the new position.
        ↓
  Hold → (right arrow) instead of clicking Next: the car moves continuously
  forward along the same tour path, accelerating the same way, for as long
  as the key is held — release to coast to a stop wherever you are, not
  necessarily at a named stop (§7.5). Hold ← to reverse. This is how a
  visitor "explores themselves" rather than stopping at every named building.
        ↓
  (repeat, any order, any number of times)
```

Deep links and reduced-motion behavior are unchanged: landing on
`/foundry/robotics-workshop` snaps straight there (that stop's title shows,
its "Next"/"Prev" position is wherever it sits in tour order), and
`prefers-reduced-motion` skips all drive/scrub animation.

**Retired from v3**: the `tourMode` toggle, the auto-advance timer, and the
Play/Pause/Exit controls. There is no longer a separate "guided tour you opt
into" versus "the regular site" — this *is* the regular site now, so the
toggle and its associated state are dead weight once titles are hidden by
default (§7.6). `useCityStore`'s `tourMode` field and `TourControls.tsx`'s
autoplay logic are removed, not just unused.

## 4. Visual & Art Direction — filling in the details

Palette and district color-coding are unchanged in spirit; §4.4 below revises
the sky/lighting values specifically as part of the day/night system. The
throughline for this revision: **nothing should read as an empty lot** — a
real city block has sidewalks and lamps between the buildings and the road; a
real yard has grass and a tree or two; a real plaza has more than a gate and
two planters.

### 4.1 Welcome Plaza — more decoration

Adds to the existing open square (gate, planters, streetlamps, trees, one
Lakeside-transition cluster, all unchanged) rather than replacing anything:
- A second streetlamp style for variety (`light-square.glb`/
  `light-square-double.glb` alongside the existing curved style) at the
  square's outer corners.
- One or two small café-seating clusters using the Commercial pack's
  `detail-parasol-a.glb`/`detail-parasol-b.glb` (already downloaded, unused
  until now) — a market/plaza-appropriate detail that reads as "people could
  sit here," reinforcing that this is a real gathering space, not just a
  monument.
- A decorative paved medallion/inlay in the plaza floor — a flat ring
  (`ringGeometry`, same primitive-geometry technique as the basketball
  court, §4.3 in v3) in a contrasting stone tone, centered in the square.
- More planters and one or two more trees along the square's outer edge so
  it doesn't read as a mostly-bare rectangle with a gate in it.

### 4.2 Downtown Foundry District — filling the ground plane

Every filler-building row (§4.1 in v3) sits on bare ground between the
building face and the road. This adds the missing layer:
- **Sidewalk strips** — a paved patch (same stone-grey tone as the Plaza's
  paving, §4.3 in v3) running the length of each filler row, between the
  road and the buildings, so there's a visible walkable surface instead of
  plain ground.
- **More streetlamps**, spaced regularly along Main Street (the existing
  utility-pole spacing pattern in `RoadNetwork.tsx`, but for light posts —
  currently there are only a handful placed ad hoc near the Plaza).
- **Street signs** at cross-street intersections (`road-sign-object-street
  .glb`/`road-sign-stop.glb` — on disk, unused).
- **Dumpsters** (`dumpster.glb` — on disk, unused) tucked behind the back
  filler row, where a real alley would have one.
- **Awnings/parasol clusters** (`detail-awning.glb`/`detail-awning-wide
  .glb`/`detail-parasol-*.glb`) on a handful of front-row filler buildings,
  for storefront variety.

### 4.3 Lakeside — green, and greener

- **A grass ground patch** covering the Lakeside arm's footprint (roughly
  the same extent as the suburb filler blocks, §4.4 in v3) in a distinct
  green tone, layered above the base ground plane — right now the suburb
  sits on the exact same cream/tan ground as downtown, which is the biggest
  single reason it doesn't yet read as "suburb" from a still frame, not just
  from the lower building density.
- **More yard greenery** — a small tree/bush cluster near each house
  (existing and filler alike), not just concentrated at the Park (§4.4 in
  v3) — reusing the same `tree-large`/`tree-small`/flower models already on
  disk.

### 4.4 Sky & atmosphere (new in v4)

Replaces the static sky/lighting setup in `CityCanvas.tsx`/`Sky.tsx` with a
real day/night cycle. See [§7.4](#74-day-night-cycle-clouds--dynamic-lights)
for the technical design; this section is what it should look and feel like:
- The sky is **darker on average** than v3's constant bright-noon look — the
  cycle spends real time at dawn/dusk/night tones, not just a brief transit
  through them.
- A **proper mountain range**: more peaks, two depth layers (distant peaks +
  closer foothills), varied silhouettes (not identical 4-sided cones) —
  reads as an actual range on the horizon, not a ring of identical shapes.
- **Drifting clouds** using drei's `<Cloud>` — a handful, slowly moving,
  giving the sky visible motion and depth.
- **Streetlamps and building windows light up** as the cycle moves into
  dusk/night, and turn back off through dawn — with the occasional brief
  flicker on a lamp, at random, the way a real lamp sometimes does.
- **A full day/night cycle every 90 seconds** (tunable, §7.4) — sun rises,
  crosses the sky, sets, and a night period passes before it rises again,
  looping continuously.

### 4.5 Asset sourcing — still no new packs

Every model named above (`light-square*`, `detail-parasol-*`,
`detail-awning*`, `road-sign-object-street`, `road-sign-stop`, `dumpster`)
was verified present in the Roads/Commercial packs already extracted at v1.
Clouds use drei's built-in procedural `<Cloud>` geometry — no texture or
model download at all.

### 4.6 Road/ground surface corrections (v5.0)

Pre-v5.0 polish already replaced most kit road tiles (`road-side.glb`,
`road-straight.glb`, `road-bend-sidewalk.glb`, `road-end-round.glb`,
`road-crossroad.glb`) with plain asphalt-colored plane geometry, after
finding they all share one busy multi-swatch texture that doesn't read as
clean asphalt when tiled. `road-driveway-single.glb` was missed — it
shares the identical texture (verified by extracting it: byte-identical
to the others') and is placed at every house, so it was still showing the
same wrong, out-of-place pattern throughout both districts. v5.0 gives it
the same fix: a plain paved plane instead of the kit model.

Every ground-plane "layer" (base ground, the suburb's grass patch,
downtown's pavement patch, the road system's asphalt, the plaza's own
pavement, sidewalks, the painted centerline) now sits at a **distinct,
deliberately ordered height**, not sharing a height with any neighboring
layer. Two of these previously *did* coincide exactly (plaza pavement and
the road system's own junction-fill patch, both y=0.01; the suburb grass
patch and downtown pavement patch, both y=-0.03) in regions that also
spatially overlap, which is a textbook z-fighting setup — visually, two
opaque coincident surfaces flicker between which one the GPU resolves as
"on top" from frame to frame, exactly the "flickering between green,
road, and gray" reported at the fork. Giving every layer its own height
turns an accidental toss-up into deterministic, stable occlusion.

The deeper cause behind *why* those planes overlapped in the first place:
Foundry's downtown filler (`foundry-blocks.ts`) places buildings on both
sides of Main Street, including its north side (positive Z), and the
Lakeside suburb's filler (`suburb-houses.ts`) places houses on both sides
of the Lakeside street, including its west side (negative X) — and both
of those "far" sides claim the *same* map quadrant near the junction,
independently of each other. Round 5's footprint expansion (§3 there)
pushed both districts' rows far enough into that shared quadrant that
actual building placements risk landing on top of each other, not just
their ground planes. A shared exclusion zone now keeps each district's
filler out of the other's claimed corner near the junction (in addition
to the wider, farther-out "neutral wedge" the forest already occupied),
and that same zone is folded into the forest's own wedge region so the
result reads as "the forest comes in a little closer here," not a bare
gap where two districts each stopped just short of each other.

### 4.7 Night lighting isn't all-or-nothing (v5.0)

§4.4/§7.4's day/night lighting (every streetlamp and every glowing window
turning on together at dusk) reads as a stage cue once you actually watch
it happen — a real city never has literally every light on at once, even
late at night. Roughly a third of lights now stay off through the night,
picked once per lamp/instance via the same seeded pseudo-randomness
already used for flicker timing rather than re-rolled per day/night
cycle — a *specific* lamp being the one that's out reads as more real
than the set of dark lamps reshuffling every cycle, and needs no
cycle-index tracking. Per streetlamp (each is its own component instance
already) and, for window glow, genuinely
**per building instance**, not per building type: window glow is one
material shared across every placement of a given model (round 4's whole
point, for cost reasons), so a per-instance on/off needed a per-instance
signal inside a *shared* shader — solved by hashing each instance's own
world position (already available per-vertex for instanced meshes) into
a pseudo-random value in the shader itself, no per-instance material
clones, no extra draw calls. Window glow's dark fraction is fixed for the
whole session, the same "picked once, not reshuffled" choice as
streetlamps — a time-varying per-instance flicker inside a shared shader
(every dark window independently, occasionally, briefly lighting up)
would need a meaningfully bigger shader (a noise function combining the
per-instance hash with a running clock, not just a static threshold) for
a subtlety easy to miss at the scale windows actually read at; streetlamps
already carry the "this city flickers" sensation at the size/prominence
where it's actually noticeable. Streetlamps get the full bidirectional
version: darkness isn't static there either — an off lamp has a small
per-second chance to flicker briefly *on*, mirroring the flicker-off
chance an on lamp already had, some rooms have a light on a timer, a sign
relay sticks briefly, the same texture of imperfection in both
directions.

### 4.8 Street furniture and a pocket park (v6.0)

"Open space" wasn't a density problem — foundry-blocks.ts/suburb-houses.ts
already fill the map about as much as a real city/suburb split reasonably
would (PRD v5.0 §3) — it was an *emptiness* problem: real paved and
grassed ground with nothing on it. No Kenney pack on disk has park
furniture (benches, a picnic table, a trash can) — the same situation
BasketballCourt.tsx already solved for a hoop/court — so
`Bench.tsx`/`PicnicTable.tsx`/`TrashCan.tsx` are built from primitive
geometry the same way, at real-world-ish proportions (a bench seat ~0.45m
high, a trash can ~0.65m tall).

Placed where the emptiness actually was, not scattered randomly:
- Both sidewalks (Main Street, the Lakeside street) get a bench + trash
  can pair at regular intervals, alternating sides, offset from the
  streetlamp interval so the two don't always coincide
  (`RoadNetwork.tsx`'s `streetFurniture()`).
- The Plaza's paved square had nothing inviting you to actually stop
  there beyond the medallion itself — two benches facing it, plus a trash
  can.
- Park.tsx's existing park (stumps were the only seating before, because
  no bench model existed) gets a real bench and a picnic table alongside
  the stumps, not instead of them.
- The single biggest genuinely-bare stretch: foundry-blocks.ts's filler
  rows stop at z=±47, but Ground.tsx's downtown pavement patch and
  Forest.tsx's forest regions don't meet until z=±54 — a ~7-unit-deep
  strip of bare paved nothing running the full length of downtown, both
  sides. `DowntownPocketPark.tsx` turns one side of that strip into a
  small green break (moss, street trees, two benches, a trash can) —
  deliberately not a full second park (there's already a real one on the
  Lakeside side), just enough that the strip reads as a leftover
  downtown block got a pocket park, not as an unfinished edge of the map.
  Positioned and bounds-checked against `blocks.ts`'s
  `WEDGE_EXCLUSION_ZONE` and Forest.tsx's own wedge region specifically —
  the exact kind of unchecked-overlap mistake that caused PRD v5.0's
  z-fighting bug.

### 4.9 A verified small-prop bug, not a guess (v6.0)

"Smaller sprites are messed up" needed an actual look at every small prop
side by side before concluding anything — a temporary, throwaway page
(`public/_debug-props.html`, removed after use) loaded every small
decorative model directly with Three.js + GLTFLoader/DRACOLoader outside
the main app entirely, laid out in a grid, **each at the exact scale its
real call site in the app uses** — a flat test scale across every model
would just reproduce a "some look huge, some look tiny" artifact from
each model's own differing native bounding box, telling you nothing real.

That render showed `streetlamp.glb` (used only by PlazaSquare.tsx's four
gate lamps, at scale 2.5) as a barely-visible sliver next to
`light-square.glb`/`light-square-double.glb` (used by every other
streetlamp in the city, at scale 5) reading as full, proper lamp posts.
Direct model-dimension inspection confirmed why: `streetlamp.glb`'s
native bounding box (0.05 × 0.675 × 0.225) is nearly identical to
`light-square.glb`'s (0.05 × 0.6 × 0.237) — these are meant to be the
same real-world size, and using scale 2.5 for one and scale 5 for the
near-identical other left the gate lamps at roughly half height, with
nothing about the gate's design calling for shorter fixtures there.
Fixed by matching scale (5) and adjusting `lampHeight` to match (the
point light's own position, previously tuned to the wrong, shorter
scale). Every other small prop checked out proportionally sound at this
pass — this was the one real, confirmed bug, not a symptom of some
broader systemic issue.

### 4.10 Fenced yards and a river (v7.0)

`Yard.tsx` gives every suburb house — both the generated filler
(`suburb-houses.ts`) and the real Lakeside attractions that are actual
houses (cafe, arcade, sports-field, open-road) — its own lawn plane and a
three-sided low picket fence (`fence-low.glb`, GPU-instanced the same way
`Forest.tsx`'s trees are: real geometry/material pulled from the glb, not
a `<Clone>` per instance). The fence leaves the street-facing edge open
with a gate-width gap in the middle rather than the house's own wall
side, which needs no panel at all. This is deliberately redundant with the
coarse `GRASS_SIZE`/`DOWNTOWN_GROUND` rectangles in `Ground.tsx` — it's
the fix that doesn't depend on two unrelated rectangles' bounds staying
clear of each other as either district's footprint grows again later.

`River.tsx` replaces the old wedge Forest region between Lakeside and
Foundry: a chain of six overlapping water circles (same technique as
Park.tsx's pond, just repeated with a drifting center for a meander
rather than one shape), plus bank rocks/flowers/a few pines. Every
segment's center+radius was checked directly against NEEMO HQ's position,
the x=-26 cross street's actual road-bed width, and DowntownPocketPark's
X_RANGE — margins of 2m+ on every side, not assumed clear.

## 5. Content Map — Resume → City

**Unchanged from v3** — no facts, copy, or district assignments change in
this revision. `src/content/tour.ts`'s `TOUR_ORDER` gains one entry: the
"More Coming Soon" lot, previously excluded ("nothing to narrate there yet"),
is now included — since Next/Prev is the *primary* way to move through the
city (§3), every stop needs a place in that sequence, including the
placeholder lot. It still has no timeline/description beyond its existing
placeholder copy.

## 6. Tech Stack

**One addition, one removal.**
- **Addition**: drei's `<Cloud>`/`<Clouds>` (§4.4/§7.4) — already ships with
  `@react-three/drei` (already a dependency), not a new package.
- **Removal**: `tourMode` and its autoplay machinery (§3) — dead state and a
  now-pointless `useEffect` timer, deleted rather than left unused.

## 7. World, Roads & Camera System

v3's `buildTripCurve(from, to)` (§7.1 there) is unchanged as the underlying
mechanism — what changes is *how it's used*: instead of building a fresh
curve for every navigation, v4 builds the **entire tour once** as a single
fixed path, and all navigation (Next/Prev, direct jumps, and the new
explore-yourself scrub) becomes movement along different points of that one
path. This is also what makes accel/decel (§7.2) and the arrow-key scrub
(§7.5) both simple: there's one continuous position to move, not a new curve
object per trip.

### 7.1 The tour curve — one fixed path for the whole city

```ts
// src/lib/tourCurve.ts — NEW
export const TOUR_CURVE: TripCurve = joinTripCurves(
  TOUR_ORDER.slice(0, -1).map((stop, i) =>
    buildTripCurve(curbFor(stop), curbFor(TOUR_ORDER[i + 1]))
  )
)

// Cumulative arc-length position (0..1) of every tour stop along TOUR_CURVE
// — computed once, from each leg's own length, not re-derived at nav time.
export const TOUR_STOP_U: number[] = /* running total of each leg's length / TOUR_CURVE.getLength() */
```

Because `buildTripCurve` already Catmull-Rom-smooths any cross-arm leg
(§7.1 in v3), the FLL Center → Café leg (the one place `TOUR_ORDER` crosses
from the Foundry arm to the Lakeside arm) gets the same smooth junction turn
as any other cross-district trip — no special case. `joinTripCurves` (also
existing, §7.1 in v3) already supports stitching heterogeneous pieces into
one arc-length-correct curve; chaining N-1 of them into one long curve is the
same operation at a larger scale, nothing new to build there.

### 7.2 Acceleration and max speed — a real velocity profile

v3 mapped a trip's whole duration through one `easeInOutCubic`, which
*looks* smooth on paper but, at v3's `DRIVE_SPEED=26`, made most trips
(many stops are only 8–20 units apart) complete in well under a second —
too fast for the eye to register as anything but a snap, regardless of how
smooth the underlying curve was. v4 replaces this with an actual trapezoidal
velocity profile: accelerate, cruise at a capped max speed, decelerate —
the standard motion-planning shape, and slower overall (§2's "so there's
time to see the city").

```ts
// src/config.ts additions
export const MAX_SPEED = 10   // was effectively ~26 — down to a believable city-street pace
export const ACCEL = 6        // units/sec² — ~1.7s to reach MAX_SPEED from a stop

// src/lib/motion.ts — NEW
// Given a trip distance D, returns how far along it (0..D) has been
// covered after `elapsed` seconds — the classic trapezoid-or-triangle
// profile depending on whether D is long enough to reach MAX_SPEED at all.
export function distanceAtTime(D: number, elapsed: number): number {
  const dAccelFull = MAX_SPEED ** 2 / (2 * ACCEL)
  if (2 * dAccelFull <= D) {
    // trapezoid: accelerate, cruise, decelerate
    const tAccel = MAX_SPEED / ACCEL
    const cruiseDist = D - 2 * dAccelFull
    const tCruise = cruiseDist / MAX_SPEED
    if (elapsed < tAccel) return 0.5 * ACCEL * elapsed ** 2
    if (elapsed < tAccel + tCruise) return dAccelFull + MAX_SPEED * (elapsed - tAccel)
    const tDecel = elapsed - tAccel - tCruise
    return D - 0.5 * ACCEL * (tAccel - tDecel) ** 2
  }
  // triangle: too short to reach MAX_SPEED — peak speed is lower, found by
  // solving 2*(peak²/2A) = D
  const peak = Math.sqrt(D * ACCEL)
  const tPeak = peak / ACCEL
  if (elapsed < tPeak) return 0.5 * ACCEL * elapsed ** 2
  const tDecel = elapsed - tPeak
  return D / 2 + peak * tDecel - 0.5 * ACCEL * tDecel ** 2
}
export function totalTripTime(D: number): number { /* mirrors the branch above, returns 2*tAccel+tCruise or 2*tPeak */ }
```

`CameraRig`'s per-frame update becomes: `progress = distanceAtTime(D,
elapsed) / D`, fed into `driveFrame()` exactly like v3's eased progress was —
`driveFrame` itself (position/look-target/rotation-damping, §7.3 in v3) is
unchanged, only *what produces* the progress value changes. Short hops (a
few units) still feel snappy — the triangle case caps their peak speed low
enough that they don't take an oddly long time either; long cross-district
legs now get a genuine sustained cruise instead of a blink-and-you-missed-it
transit.

### 7.3 Position tracking — one continuous `u`, not one curve per trip

`CameraRig` now tracks a single float `currentU` (progress along
`TOUR_CURVE`, not per-trip `t`). Clicking Next/Prev animates `currentU` from
its current value to `TOUR_STOP_U[index ± 1]` using §7.2's velocity profile,
exactly as before conceptually — the only change is that the *curve* being
moved along is always the same shared `TOUR_CURVE`, and the *target* is a
lookup into `TOUR_STOP_U` instead of a freshly computed curb point. Direct
jumps (AccessibleNav, breadcrumb, deep links) work the same way: look up the
target stop's `TOUR_STOP_U` entry and animate there. **Next/Prev no longer
wrap around** (v3's modulo wraparound is removed) — at the first or last
stop, the corresponding button is disabled, the same way a real tour doesn't
loop from the end back to the start mid-drive.

### 7.4 Day/night cycle, clouds & dynamic lights

```ts
// src/config.ts additions
export const DAY_NIGHT_CYCLE_SECONDS = 90

// src/components/scene/DayNightCycle.tsx — NEW
// One useFrame loop owns: the sun's orbit position, the sky/fog color, the
// directional + hemisphere light intensity/color, and an `isNight` boolean
// (sun elevation below a threshold) that everything else (streetlamps,
// window glow) reads.
function DayNightCycle() {
  useFrame(({ clock }) => {
    const phase = (clock.getElapsedTime() % DAY_NIGHT_CYCLE_SECONDS) / DAY_NIGHT_CYCLE_SECONDS
    const elevation = Math.sin(phase * Math.PI * 2) // -1 (deep night) .. 1 (noon)
    // sun position orbits overhead on a fixed east-west arc, scaled by elevation
    // sky/fog/light color + intensity are multi-stop lerps keyed on `elevation`
    // (dawn → day → dusk → night → dawn), darker on average than v3's static values (§4.4)
    setIsNight(elevation < NIGHT_THRESHOLD) // zustand slice or a small context, read by StreetLamp/WindowGlow below
  })
}
```

**Streetlamps**: each placed lamp gets a real, non-shadow-casting
`THREE.PointLight` at its lamp-head position, `intensity` driven to 0 during
day and to a warm glow during night — plus a small per-lamp random chance
each frame (while lit) to briefly dip intensity for a flicker, using a
per-instance seeded offset so lamps don't all flicker in unison (that would
read as fake/synchronized rather than incidental).

**Window glow**: cheaper than real lights — an emissive color/intensity bump
on the shared "glass" material (§9) during night, no per-window light
source. Kenney building glass materials are shared across many instances
(confirmed in v2/v3 QA — one `MeshStandardMaterial` named `glass` used dozens
of times), so this single material-level change lights up every building's
windows across the whole city in one draw-call-free operation — a case where
reusing the existing shared-material structure is the efficient *and* the
correct choice, not a shortcut.

**Clouds**: a handful of drei `<Cloud>` instances scattered across the sky
dome at varied positions/scales, using the component's own `speed` prop for
drift — no custom animation code needed.

**Mountains** (`Ground.tsx`'s `Mountains()`): two concentric rings instead of
one (distant peaks + closer foothills), more peaks per ring, `coneGeometry`
side-count randomized per peak (4–7, seeded) instead of fixed at 4, for a
genuinely varied range silhouette instead of a ring of identical shapes.

### 7.5 Explore yourself — continuous scrub along the tour path

```ts
// Inside CameraRig, alongside the Next/Prev-driven animation:
const SCRUB_KEYS = { ArrowRight: 1, ArrowLeft: -1 } as const
// On keydown/keyup (ignored while focus is in an input, or with a modifier
// key held, to avoid fighting browser back/forward shortcuts): track which
// direction is currently held. While held, ramp a scrub speed from 0 toward
// MAX_SPEED using the same ACCEL constant as §7.2 (so starting to scrub
// feels like the same car accelerating, not an instant jump to full speed);
// on release, ramp back down to 0 the same way, coasting to a stop wherever
// that lands rather than snapping back to the nearest stop.
//
// currentU += direction * (scrubSpeed * delta) / TOUR_CURVE.getLength()
// While scrubbing, the look-target uses the "ahead along the path" mode
// (the same one driveFrame() already uses mid-trip, §7.3 in v3) rather than
// tilting up at whatever stop is nearest — tilting at every passing
// building while gliding past several of them would be visually chaotic.
// Only on release does the camera settle: find the nearest TOUR_STOP_U
// entry to the final currentU and ease the look-target to that stop's tilt,
// treating a release as "arrived here" for panel/title purposes (§7.6) —
// this is also the "skip stopping at other attractions if held long enough"
// behavior the user asked for: nothing forces a stop at an intermediate
// attraction just because currentU passed its TOUR_STOP_U value mid-scrub.
```

Reduced-motion: the accel/decel ramp on press/release is skipped (scrub
speed is either 0 or `MAX_SPEED` instantly) — the *feature* still works, just
without the ramp animation, consistent with how every other motion in the
app already respects `prefers-reduced-motion`.

### 7.6 Hotspots — title only when active

`Hotspot.tsx`'s proximity+heading visibility gate (v2/v3's `isNear`
tracking, a `useFrame` loop checking camera distance and forward-direction
every few frames) is **removed entirely** — the marker now renders if and
only if `attraction.id === activeAttractionId`. This is a real
simplification, not just a behavior change: the whole distance/dot-product
tracking `useFrame` loop goes away along with the reason it existed (v2/v3
needed it because markers were visible from a distance; v4 markers are never
visible from a distance in the first place). The one visible marker also
stops being a `<button>` — since it's never a navigation target anymore (you
only ever see it once you're already there), it becomes a plain label,
matching its new purely-informational role.

### 7.8 ExploreScrubBar — visual feedback and a shortcut for §7.5 (v6.0)

§7.5's explore-yourself scrub had no visual feedback (no sense of where
you are along the tour while holding an arrow key) and no shortcut (no
way to jump to a specific stop without physically scrubbing/driving
there). A new bottom bar fixes both, rendered only while
`activeAttractionId === null` — TourBar.tsx's exact mirror-image
condition (it already renders nothing during a scrub, §9), so the two
bars are mutually exclusive by construction and never compete for the
same screen slot.

The technical wrinkle: `currentURef`, CameraRig's own position along
`TOUR_CURVE`, is a plain ref private to that component, updated every R3F
frame. A DOM overlay outside the `<Canvas>` can't use `useFrame` to read
it, and pushing it through Zustand every frame would re-render every
subscriber at 60fps for what's normally a purely cosmetic slider
position — the same category of problem `dayNightState`/`windowGlow`'s
registries already solved with a shared mutable object instead of React
state. `src/lib/scrubState.ts` is that same pattern applied here:

```ts
// src/lib/scrubState.ts — NEW
export const scrubState = {
  currentU: 0,           // CameraRig writes this every frame; the bar reads
                          // it in its own requestAnimationFrame loop to move
                          // the slider thumb imperatively, no re-render.
  requestedU: null as number | null,
                          // the bar writes this while a drag is in progress;
                          // CameraRig checks it at the top of useFrame and,
                          // if set, drives the camera straight there via
                          // scrubFrame() (the same function keyboard-held
                          // scrubbing already uses) — then the check falls
                          // through to normal keyboard-scrub/drive logic
                          // whenever it's null.
}
```

Dragging the bar's track computes a 0..1 position from the pointer's X
position and writes it to `scrubState.requestedU` every `pointermove` —
CameraRig picks it up next frame, same visual treatment (no arrival-tilt
blend) as holding an arrow key. Releasing the drag clears `requestedU`
and calls `navigate()` to the nearest `TOUR_STOP_U` entry directly — the
exact same "settle onto the nearest stop" `navigate()` call §7.5's own
release-and-coast logic already makes, just triggered immediately instead
of after a deceleration ramp. Each stop also gets its own small tick mark
positioned at its real `TOUR_STOP_U` value along the track; clicking one
calls `navigate()` straight to that stop, skipping the drag/scrub
entirely — the click-to-jump half of the ask, reusing the identical
router-driven discrete-drive path Prev/Next/AccessibleNav already trigger,
not a new navigation mechanism.

### 7.9 Arrival standoff for unusually tall buildings (v7.0 round 2)

Every attraction parks at `curbFor()`'s nearest point on its own arm's road
centerline — a fixed ~9m perpendicular distance from the building for
every attraction, since that's just a geometric property of the arm/lot
layout, not something the camera code chooses per attraction. That
standoff frames every attraction from 2-4m tall correctly, but Robotics
Workshop (11m) and DECA Business Center (13.4m, both real kitbashed
towers) are tall enough that 9m away doesn't fit the silhouette in frame
— confirmed by screenshotting both and finding neither read as "a
building," just flat wall.

`camera.ts`'s `standoffBoost(height)` returns `0` below a 4m threshold
(so 10 of 12 attractions are completely unaffected) and scales up from
there, capped at 3.5m extra. `applyStandoff()` pushes the camera further
in the same direction it's already offset from the building (i.e. "back
away, don't reroute" — no new position logic, just extending the existing
offset vector), applied in both `snapTo` (instant placement) and
`driveFrame`'s position calculation, blended in via the same
`arrivalBlend` fraction the arrival tilt already uses so there's no
position pop on arrival.

A first attempt also capped the *height* fed into the existing arrival
tilt target, reasoning that a shorter look-target height means a gentler
upward angle — reverted after screenshotting it: combined with the
standoff push-back, the capped tilt aimed proportionally too low for the
now-further-back camera and clipped the hotspot title marker
(`attraction.height + 1.5`, uncapped) off the top of the frame. The real,
uncapped height is the correct tilt target regardless of standoff
distance — only the distance needed fixing, not the angle.

## 8. Data Model

```ts
// src/store/useCityStore.ts — CHANGED
// REMOVED: tourMode / setTourMode (§3, §6) — dead state once titles are
// hidden by default; there's no longer a distinct "tour mode" to toggle.
// activeAttractionId still starts as the Welcome Plaza's id, not null — see
// the RouteSync change below, this is what makes "selected off the start" true.
```

```ts
// src/App.tsx's RouteSync — CHANGED
// Was: setActive(attraction?.id ?? null) — bare "/" resolved to null,
// meaning no panel/title showed until a stop was explicitly clicked.
// Now: setActive(attraction?.id ?? HOME_ATTRACTION_ID) — bare "/" resolves
// to the Welcome Plaza's own id, so its panel/title are already showing on
// first load, exactly like landing on any other stop's deep link.
```

```ts
// src/lib/tourCurve.ts — NEW (§7.1)
export const TOUR_CURVE: TripCurve
export const TOUR_STOP_U: number[]  // one entry per TOUR_ORDER stop
```

```ts
// src/lib/motion.ts — NEW (§7.2)
export function distanceAtTime(D: number, elapsed: number): number
export function totalTripTime(D: number): number
```

```ts
// src/content/tour.ts — CHANGED (§5)
// TOUR_ID_ORDER gains 'coming-soon' at the end — every stop now has a place
// in the one sequence Next/Prev/scrub travel along.
```

## 9. Component Architecture

Additions and changes only — everything not listed here is unchanged from v3 §9.

```
src/
  lib/
    tourCurve.ts             NEW — TOUR_CURVE, TOUR_STOP_U (§7.1)
    motion.ts                 NEW — distanceAtTime(), totalTripTime() (§7.2)
  components/
    scene/
      CameraRig.tsx            REWRITTEN — tracks one currentU along TOUR_CURVE instead of building a per-trip curve; velocity-profile progress (§7.2) instead of easeInOutCubic; arrow-key scrub handling (§7.5)
      Hotspot.tsx              SIMPLIFIED — marker renders iff active; no more proximity/heading useFrame loop (§7.6); marker is a label, not a button
      DayNightCycle.tsx        NEW — sun orbit, sky/fog/light color & intensity, isNight flag (§7.4)
      StreetLamp.tsx           NEW — wraps a lamp model + a PointLight whose intensity is driven by isNight, with per-instance flicker (§7.4); replaces ad hoc <Building model="streetlamp.glb"/> placements wherever a light should actually work
      Clouds.tsx               NEW — a handful of drei <Cloud> instances (§7.4)
      Ground.tsx               MODIFIED — Mountains() gets two rings + varied cone sides (§7.4); adds a Lakeside grass patch (§4.3)
      PlazaSquare.tsx          MODIFIED — more streetlamp variety, parasol clusters, paved medallion, more planters/trees (§4.1)
      RoadNetwork.tsx          MODIFIED — sidewalk strips per filler row, more streetlamps, street signs, dumpsters, awning/parasol clusters (§4.2)
      Suburb.tsx / suburb-houses.ts   MODIFIED — more yard greenery per house (§4.3)
    ui/
      TourControls.tsx         RENAMED to TourBar.tsx — always rendered (no tourMode gate), Prev/Next only (no Play/Pause/Exit), disabled (not wrapped) at the first/last stop (§7.3)
  store/
    useCityStore.ts            CHANGED — tourMode/setTourMode removed (§6, §8)
  content/
    tour.ts                    CHANGED — adds 'coming-soon' to TOUR_ID_ORDER (§5)
```

## 10. Accessibility & SEO

Unchanged from v3, with one semantic note: the visible hotspot marker is now
a label (`<span>`/`<div>`, not a `<button>`) since it's never itself a
navigation target (§7.6) — `AccessibleNav` remains the guaranteed-reachable
path for every stop regardless of camera state, unaffected by any of this.
`TourBar`'s Prev/Next buttons get `disabled` (not just visually dimmed) at
the first/last stop, so screen readers and keyboard users get the same
"nothing before/after this" signal a sighted mouse user sees.

## 11. Responsive / Mobile

Unchanged from v3. The arrow-key scrub (§7.5) is a desktop-keyboard-only
affordance — mobile visitors still have Next/Prev taps; this isn't a
regression, it's an *additional* control for a class of input mobile doesn't
have, the same way v1–v3 never assumed keyboard-only or touch-only.

## 12. Performance Budget

- **Real-time point lights are capped, not per-lamp-instance.** Every
  streetlamp gets a `StreetLamp.tsx` wrapper, but only a bounded set (e.g.
  the ones within the Plaza and along Main Street's first couple of blocks —
  exact cutoff tuned empirically, §17) get a real `PointLight`; the rest use
  the same emissive-glow-only treatment as building windows (§7.4). This is
  the same "measure, don't guess" policy as every prior perf section — v3's
  QA already found this project's headroom is large on real hardware (§12 in
  v3), but *unbounded* real-time lights is a different cost category
  (per-light, per-fragment) than static geometry, and deserves its own cap
  rather than assuming the same headroom applies unexamined.
- No new shadow-casting lights — the sun remains the only shadow caster
  (§2's non-goal). Streetlamp/window light is glow, not shadow-affecting.
- Total triangle count: unaffected by this revision's changes (props are
  low-poly, same asset scale as everything already placed) — still well
  under v3's <600k budget headroom.
- FPS/Lighthouse targets unchanged — re-verify after this revision, same
  discipline as every prior phase's QA (§14).

## 13. Build Phases

Continues numbering — v3 shipped through Phase 19.

**Phase 20 — Tour curve + velocity-profile motion (highest technical risk —
build and prove this before touching any UI or decoration)**
Build `lib/tourCurve.ts` (`TOUR_CURVE`, `TOUR_STOP_U`) and `lib/motion.ts`
(`distanceAtTime`, `totalTripTime`); rewrite `CameraRig.tsx` to track one
`currentU` and drive it via the velocity profile instead of a per-trip curve
+ `easeInOutCubic`. Validate Next/Prev across every stop (including the
FLL→Café cross-arm leg) before Phase 21 touches any UI.

**Phase 21 — Navigation UX overhaul**
`RouteSync` defaults to the Welcome Plaza id instead of null; remove
`tourMode`/autoplay from the store and `TourControls.tsx`; rename/rebuild it
as always-rendered `TourBar.tsx` with disabled-at-the-ends Prev/Next;
simplify `Hotspot.tsx` to active-only marker rendering, demoted to a label;
add arrow-key scrub handling to `CameraRig.tsx` (§7.5).

**Phase 22 — City & suburb decoration**
Export the newly-needed props (`light-square*`, `detail-parasol-*`,
`detail-awning*`, `road-sign-object-street`, `road-sign-stop`, `dumpster`);
build the Plaza's additional decoration (§4.1); add sidewalk strips,
streetlamps, signs, dumpsters, and awnings to `RoadNetwork.tsx` (§4.2); add
the Lakeside grass patch and per-house yard greenery (§4.3).

**Phase 23 — Atmosphere: day/night, mountains, clouds, dynamic lights**
Build `DayNightCycle.tsx`, `StreetLamp.tsx`, `Clouds.tsx`; upgrade
`Mountains()` to two rings with varied silhouettes (§7.4/§4.4). Verify the
full 90-second cycle at least twice through in one sitting — this is the one
feature in this PRD that can't be fully checked from a single screenshot.

**Phase 24 — Re-QA & redeploy**
Full regression per §14, redeploy. Re-measure FPS/Lighthouse — don't assume
any v3 result still holds after a real-time lighting system and a rewritten
motion system.

## 14. QA Checklist

Everything in v3's §14 still applies; these are additions specific to v4.

- [ ] On first load (no deep link), the Welcome Plaza's title and panel are
      already showing — not a neutral unlabeled home state
- [ ] While driving between any two stops, no other building's title is
      visible at any point mid-drive — only the destination's, once arrived
- [ ] Next/Prev disable (not wrap) at the first/last tour stop
- [ ] A short hop (e.g. two adjacent Foundry filler-adjacent stops) and a
      long cross-district leg (FLL → Café) both visibly show
      accelerate/cruise/decelerate, not a snap — sanity-check both ends of
      the distance range, same discipline as v2's arrival-tilt check
- [ ] Holding → for a few seconds visibly glides past at least one named
      stop without stopping there, then releasing settles the camera
      sensibly wherever it lands
- [ ] Holding ← reverses correctly, including back across the junction
      corner if the current position is on the Lakeside arm
- [ ] Downtown: walking the eye down a filler row shows sidewalk, at least
      one streetlamp, and at least one other prop (sign/dumpster/awning) —
      not three buildings on bare ground
- [ ] Lakeside: the ground is visibly green under the suburb, distinct from
      the downtown ground color, from a still frame alone
- [ ] A full day/night cycle observed at least once: sky darkens, sun
      crosses and sets, streetlamps/windows light up, then a sunrise
      restarts the cycle — not just a color tint with no motion
- [ ] At least one streetlamp visibly flickers during a night period within
      a couple of minutes of watching (random, so not on a fixed schedule)
- [ ] FPS/Lighthouse re-measured with the day/night lights and clouds
      active, not just with them dormant at daytime phase

## 15. Deployment

Unchanged from v3.

## 16. Runbook — Adding to the City

Unchanged from v3, with one addition: a new Attraction now also needs its id
added to `TOUR_ID_ORDER` in `src/content/tour.ts` (§5) — since Next/Prev and
the explore-yourself scrub are now the primary way through the city, a stop
missing from that list would be unreachable except via a direct deep link or
`AccessibleNav`.

## 17. Open Questions / Future Enhancements

- **Exact cutoff for which streetlamps get a real `PointLight` vs.
  glow-only** (§12) — implementation-time tuning against actual FPS
  measurement, not a number to guess up front.
- **Exact day/night color keyframes and the night-threshold elevation**
  (§7.4) — same tune-via-running-scene approach as every prior PRD's camera
  numbers.
- Carried over, still open: a literal Lakeside entrance sign (v3 §17), a net
  mesh on the basketball hoops (v3 §17), the Onshape→Blender→GLB pipeline,
  custom domain, sound design.

## 18. v7.0 Self-Review Log

The standing directive behind v7.0 (beyond round 1's explicit asks): drive
the deployed tour personally, note every real flaw with total honesty, and
keep iterating — implement, re-review, repeat — until nothing legitimate
is left. This section is the single consolidated record of that process,
rather than something scattered only across each round's revision note
above. Every item below was found by actually using the deployed site
(screenshots, scrub sweeps, real drive-throughs, Lighthouse runs, keyboard
navigation) — not by re-reading source and guessing.

**Found and fixed, rounds 2-11** (full detail in each round's own revision
note near the top of this file):
1. A whole-app crash: `<Cloud>`'s default third-party CDN texture, no
   error boundary anywhere → self-hosted texture + `CanvasErrorBoundary`.
2. Two tall buildings' arrival shots didn't fit their silhouette in frame
   → `standoffBoost()` in `camera.ts`.
3. A streetlamp 0.5m from a parked camera spot → proximity-filtered.
4. Clouds rendering dark under scene lighting (half of the original
   "dark tentacle" report) → unlit material.
5. A mobile layout bug hiding the résumé download and Prev/Next for the
   entire mobile visit → both floating bars moved into InfoPanel on mobile.
6. Missing `llms.txt` (a new Lighthouse audit category) → added.
7. A broken/leaning fence 3D model used throughout the suburb → swapped.
8. TourBar's Next button ignoring district accent color → fixed.
9. The REAL "dark tentacle" bug (the Welcome Plaza gate lamps' curved-arm
   model) → swapped to the same model every other streetlamp uses.
10. Clouds still darkened by fog independently of lighting (the other half
    of the original report, survived round 4's fix) → fog disabled on the
    cloud material specifically.
11. A stale `og-image.png` still showing the (now-fixed) cloud bug and the
    pre-round-1 city → regenerated.
12. An em/en dash inconsistency in one timeline entry's copy → fixed.
13. Two dead, misleading fields on `DistrictMeta` → removed.

**Verified clean, not just assumed** (checked directly, nothing found):
suburb house lot spacing vs. real footprint width at the new tighter
6-row density (no clipping); the fixed-position driveway paving mark
against the much-deeper outer suburb rows (blends into the sidewalk,
not a visible defect); every other Kenney asset for a "curved" internal
mesh name matching the gate-lamp bug's signature (none found — the fix
was exhaustive, not a spot patch); keyboard-only navigation end to end,
including the welcome overlay's focus trap; a full real-motion (not
reduced-motion) drive-through of all 12 stops via repeated Next clicks,
spanning a full day/night transition; Lighthouse desktop and mobile
against the final build (0.99/~15ms TBT desktop, 0.82/~230ms TBT mobile —
matching the historical v4.0 mobile baseline despite substantially more
geometry, confirming the instancing discipline held).

**Known, disclosed limitation**: this sandbox only has Chromium available
for testing — Firefox/WebKit installation failed on missing system
dependencies partway through this session, and wasn't re-attempted since
Chromium-only testing has been this project's standing, documented
constraint since v4.0's QA record. Cross-browser rendering differences
(if any) are unverified, not verified-clean, for this v7.0 pass.

**Current honest assessment**: after this many independent passes across
functionality, every point in the day/night cycle, mobile layout,
keyboard accessibility, performance, asset-level silhouette correctness,
and prose copy — each pass finding genuinely fewer and smaller issues
than the last, and the most recent full sweep (round 11's drive-through)
finding zero new defects — this is the point where continuing to search
for problems without a new signal (a fresh screenshot, a different
device, an actual user's reaction) would mean manufacturing findings
rather than reporting real ones. That's the honest state of the review,
not a claim that literally nothing could ever be improved further.
