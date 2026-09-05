import { create } from 'zustand'

interface CityState {
  /** id of the Attraction currently focused (camera flown to + panel open), or null when at the overview shot. */
  activeAttractionId: string | null
  setActiveAttractionId: (id: string | null) => void

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

  tourMode: false,
  setTourMode: (on) => set({ tourMode: on }),

  webglSupported: true,
  setWebglSupported: (ok) => set({ webglSupported: ok }),
}))

export default useCityStore
