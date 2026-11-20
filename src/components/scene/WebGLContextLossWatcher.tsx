import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { DirectionalLight } from 'three'
import useCityStore from '../../store/useCityStore'

const RESTORE_TIMEOUT_MS = 5_000

export default function WebGLContextLossWatcher() {
  const { gl, scene, invalidate } = useThree()
  const setWebglSupported = useCityStore((s) => s.setWebglSupported)

  useEffect(() => {
    const canvas = gl.domElement
    let timeout: number | undefined

    const onRestored = () => {
      window.clearTimeout(timeout)
      scene.traverse((object) => {
        if (object instanceof DirectionalLight) object.shadow.needsUpdate = true
      })
      invalidate()
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => setWebglSupported(false), RESTORE_TIMEOUT_MS)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      window.clearTimeout(timeout)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [gl, invalidate, scene, setWebglSupported])

  return null
}
