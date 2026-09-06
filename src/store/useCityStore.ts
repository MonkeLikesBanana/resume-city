import { create } from 'zustand'
import { isWebGL2Supported } from '../lib/webgl'

interface CityState {
  /** id of the Attraction currently focused (camera driven to + panel open).
   * Null is now transient-only — the explore-yourself scrub (PRD v4 §7.5)
   * sets it directly while gliding, to hide the title/panel until it
   * settles. Every real navigation (route change, Next/Prev, a scrub
   * settling) sets a real id, including on first load — the Welcome Plaza
   * is selected from the start (§3), there's no more "home = null" state. */
  activeAttractionId: string | null
  setActiveAttractionId: (id: string | null) => void

  /** PRD §3/§13 Phase 5 — has the visitor dismissed the "Enter the City"
   * welcome overlay yet (or bypassed it via a deep link)? Session-local, not
   * persisted — always starts false on a fresh load per §3's flow. */
  hasEntered: boolean
  setHasEntered: (v: boolean) => void

  /** PRD §10/§6 — WebGL2 support / context-loss flag, drives NoWebGLFallback (Phase 6). */
  webglSupported: boolean
  setWebglSupported: (ok: boolean) => void
}

const useCityStore = create<CityState>((set) => ({
  activeAttractionId: null,
  setActiveAttractionId: (id) => set({ activeAttractionId: id }),

  hasEntered: false,
  setHasEntered: (v) => set({ hasEntered: v }),

  webglSupported: isWebGL2Supported(),
  setWebglSupported: (ok) => set({ webglSupported: ok }),
}))

export default useCityStore
