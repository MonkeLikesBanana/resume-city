import { Component, type ReactNode } from 'react'
import NoWebGLFallback from '../ui/NoWebGLFallback'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Replace the full experience on a rendering failure so its controls do not cover the text résumé. */
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
