/** PRD v6.0 §3 — a shared mutable object, not React state, bridging
 * CameraRig (owns the camera, runs inside the R3F render loop) and
 * ExploreScrubBar (a plain DOM overlay outside the Canvas, so it can't use
 * useFrame) — the same pattern dayNightState/windowGlow's registries
 * already use for anything that changes every frame: pushing this through
 * Zustand would re-render every subscriber at 60fps for a value that's
 * purely cosmetic (a slider thumb position) the vast majority of the time.
 *
 * currentU: CameraRig writes this every frame (wherever it already writes
 * its own currentURef) — ExploreScrubBar reads it in its own
 * requestAnimationFrame loop to move the slider thumb, imperatively, no
 * re-render.
 *
 * requestedU: the bar writes this while the user is actively dragging the
 * slider track; CameraRig checks it at the top of its own useFrame and, if
 * set, drives the camera straight there via the same scrubFrame() used for
 * keyboard-held scrubbing, then clears it. null means "no drag in
 * progress" — CameraRig falls through to its normal keyboard-scrub/drive
 * logic. */
export const scrubState = {
  currentU: 0,
  requestedU: null as number | null,
}
