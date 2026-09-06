import { create } from 'zustand'
import { isWebGL2Supported } from '../lib/webgl'

interface CityState {
  /** id of the Attraction currently focused (camera driven to + panel open), or null when at the Welcome Plaza home state. */
  activeAttractionId: string | null
  setActiveAttractionId: (id: string | null) => void

  /** PRD §3/§13 Phase 5 — has the visitor dismissed the "Enter the City"
   * welcome overlay yet (or bypassed it via a deep link)? Session-local, not
   * persisted — always starts false on a fresh load per §3's flow. */
  hasEntered: boolean
  setHasEntered: (v: boolean) => void

  /** PRD §13 Phase 7 — guided tour autoplay state. */
  tourMode: boolean
  setTourMode: (on: boolean) => void

  /** PRD §10/§6 — WebGL2 support / context-loss flag, drives NoWebGLFallback (Phase 6). */
  webglSupported: boolean
  setWebglSupported: (ok: boolean) => void
}

const useCityStore = create<CityState>((set) => ({
  activeAttractionId: null,
  setActiveAttractionId: (id) => set({ activeAttractionId: id }),

  hasEntered: false,
  setHasEntered: (v) => set({ hasEntered: v }),

  tourMode: false,
  setTourMode: (on) => set({ tourMode: on }),

  webglSupported: isWebGL2Supported(),
  setWebglSupported: (ok) => set({ webglSupported: ok }),
}))

export default useCityStore
