import { Component, type ReactNode } from 'react'
import NoWebGLFallback from '../ui/NoWebGLFallback'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** PRD v7.0 round 2 — defense-in-depth after a real, confirmed failure
 * mode: an uncaught error anywhere inside <Canvas> (React Three Fiber
 * renders the whole tree outside React's normal DOM reconciliation, so a
 * thrown error there unmounts the entire app, not just the 3D scene) left
 * visitors looking at a blank white page with no indication anything went
 * wrong. The actual trigger found this round was Clouds.tsx's third-party
 * CDN texture fetch failing (now fixed at the source, a self-hosted
 * texture) — but a boundary here means ANY future WebGL/asset failure
 * degrades the same way NoWebGLFallback already handles "this
 * device/browser can't run the 3D scene at all" (§10/§13 Phase 6): full
 * resume content still reachable, not just an apology. React error
 * boundaries must be class components — no hook equivalent exists. */
export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Vasnova City: the 3D scene failed to render.', error)
  }

  render() {
    if (this.state.hasError) return <NoWebGLFallback />
    return this.props.children
  }
}
