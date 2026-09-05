import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { computeDefaultShot, flyTo } from '../../lib/camera'
import { CAMERA, OVERVIEW_SHOT } from '../../config'
import useReducedMotion from '../../hooks/useReducedMotion'

/** PRD §7.3 — the only component that touches CameraControls directly.
 * Every other component just sets `activeAttractionId` on the store; this
 * watches that value and drives the actual flight. User-driven orbit/pan/
 * zoom is disabled (§2/§6/§7.3 — every camera move is code-triggered, never
 * drag-triggered); the imperative setLookAt API still works with input
 * disabled. */
export default function CameraRig() {
  const controlsRef = useRef<CameraControlsImpl>(null)
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    for (const btn of ['left', 'right', 'wheel', 'middle'] as const) {
      controls.mouseButtons[btn] = CameraControlsImpl.ACTION.NONE
    }
    for (const t of ['one', 'two', 'three'] as const) {
      controls.touches[t] = CameraControlsImpl.ACTION.NONE
    }
  }, [])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const shot = activeAttractionId
      ? (() => {
          const attraction = getAttraction(activeAttractionId)
          if (!attraction) return OVERVIEW_SHOT
          return attraction.cameraShot ?? computeDefaultShot(attraction.position, attraction.footprint)
        })()
      : OVERVIEW_SHOT

    flyTo(controls, shot, !reducedMotion)
  }, [activeAttractionId, reducedMotion])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={CAMERA.smoothTime}
      draggingSmoothTime={CAMERA.draggingSmoothTime}
      restThreshold={CAMERA.restThreshold}
    />
  )
}
