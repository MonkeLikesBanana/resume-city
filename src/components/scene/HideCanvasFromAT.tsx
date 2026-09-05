import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/** PRD §10 — "aria-hidden on the canvas itself." Must target the actual
 * <canvas> DOM node, not a wrapping <div> — R3F's <Canvas> forwards extra
 * HTML attributes to its wrapper div (see CanvasProps), and drei's <Html>
 * markers portal into that same wrapper as siblings of <canvas>, not
 * descendants of it. Hiding the wrapper would hide the Html buttons too;
 * hiding only gl.domElement hides just the pixels, leaving the real
 * clickable/focusable markers in the accessibility tree. */
export default function HideCanvasFromAT() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.domElement.setAttribute('aria-hidden', 'true')
    gl.domElement.setAttribute('role', 'presentation')
  }, [gl])
  return null
}
