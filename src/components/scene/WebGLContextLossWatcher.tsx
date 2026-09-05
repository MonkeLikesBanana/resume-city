import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import useCityStore from '../../store/useCityStore'

/** PRD §10/§6 — "listen for the webglcontextlost event on the canvas."
 * Support existing at load time isn't the only failure mode — a GPU driver
 * crash mid-session fires this event too. Either way, the fallback is the
 * same: fall back to NoWebGLFallback rather than leave a dead black canvas. */
export default function WebGLContextLossWatcher() {
  const gl = useThree((s) => s.gl)
  const setWebglSupported = useCityStore((s) => s.setWebglSupported)

  useEffect(() => {
    const canvas = gl.domElement
    const onLost = (e: Event) => {
      e.preventDefault()
      setWebglSupported(false)
    }
    canvas.addEventListener('webglcontextlost', onLost, false)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [gl, setWebglSupported])

  return null
}
