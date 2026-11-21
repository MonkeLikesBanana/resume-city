import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onFailure: () => void
}

interface State {
  hasError: boolean
}

/** The story remains readable if the decorative scene fails. */
export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Vasnova City: the 3D scene failed to render.', error)
    this.props.onFailure()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
