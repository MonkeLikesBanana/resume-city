import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { DirectionalLight } from 'three'

const RESTORE_TIMEOUT_MS = 5_000

export default function WebGLContextLossWatcher({ onFailure }: { onFailure: () => void }) {
  const { gl, scene, invalidate } = useThree()

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
      timeout = window.setTimeout(onFailure, RESTORE_TIMEOUT_MS)
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      window.clearTimeout(timeout)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [gl, invalidate, onFailure, scene])

  return null
}
