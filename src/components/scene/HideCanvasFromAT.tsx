import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/** Hide the actual canvas from assistive technology. The surrounding HTML provides navigation and content. */
export default function HideCanvasFromAT() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.domElement.setAttribute('aria-hidden', 'true')
    gl.domElement.setAttribute('role', 'presentation')
  }, [gl])
  return null
}
