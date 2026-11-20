import { create } from 'zustand'
import { isWebGL2Supported } from '../lib/webgl'

interface CityState {
  /** A null stop means the camera is scrubbing between entries. */
  activeAttractionId: string | null
  setActiveAttractionId: (id: string | null) => void

  /** Keep the welcome state in memory so it survives navigation within the visit. */
  hasEntered: boolean
  setHasEntered: (v: boolean) => void

  /** Switch to the text résumé if WebGL is unavailable or fails to recover. */
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
