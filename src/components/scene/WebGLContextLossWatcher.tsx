import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import useCityStore from '../../store/useCityStore'

const RESTORE_TIMEOUT_MS = 5_000

export default function WebGLContextLossWatcher() {
  const gl = useThree((s) => s.gl)
  const setWebglSupported = useCityStore((s) => s.setWebglSupported)

  useEffect(() => {
    const canvas = gl.domElement
    let timeout: number | undefined

    const onRestored = () => window.clearTimeout(timeout)
    const onLost = (event: Event) => {
      event.preventDefault()
      onRestored()
      timeout = window.setTimeout(() => setWebglSupported(false), RESTORE_TIMEOUT_MS)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      onRestored()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [gl, setWebglSupported])

  return null
}
