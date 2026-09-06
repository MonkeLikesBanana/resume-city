import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { nearestTOnRoad } from '../../lib/road'
import { stepDrive, arriveAndTilt, driveDuration } from '../../lib/camera'
import { CAMERA, HOME_ATTRACTION_ID } from '../../config'
import useReducedMotion from '../../hooks/useReducedMotion'
import type { Attraction } from '../../types/attraction'

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

function curbTFor(attraction: Attraction): number {
  return attraction.curbT ?? nearestTOnRoad(attraction.position)
}

interface DriveState {
  fromT: number
  toT: number
  direction: 1 | -1
  startTime: number
  duration: number
  attractionId: string
}

/** PRD v2 §7.3/§9 — the only component that touches CameraControls (or the
 * raw camera) directly. Owns the two-phase drive-then-tilt state machine:
 * phase 1 (driving) writes camera.position/lookAt every frame via useFrame,
 * bypassing CameraControls; phase 2 (arrived) hands off to CameraControls for
 * a damped tilt. This is the only place both systems touch the same camera
 * object, which is exactly why the phase hand-off has to live here. */
export default function CameraRig() {
  const controlsRef = useRef<CameraControlsImpl>(null)
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const reducedMotion = useReducedMotion()

  const currentTRef = useRef(0)
  const lookTargetRef = useRef(new THREE.Vector3())
  const driveRef = useRef<DriveState | null>(null)
  const hasInitializedRef = useRef(false)

  // User-driven orbit/pan/zoom stays disabled — every camera move here is
  // code-triggered (unchanged principle from v1).
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

    // PRD v2 §7.4 — no free aerial overview; null (the "/" route) means "home,"
    // which is the Welcome Plaza's curb point, not a bird's-eye shot.
    const targetId = activeAttractionId ?? HOME_ATTRACTION_ID
    const attraction = getAttraction(targetId)
    if (!attraction) return
    const toT = curbTFor(attraction)

    // First-ever placement (mount / deep link) or reduced-motion: snap, don't
    // drive — same "instant on first render" rule v1 used for its flight.
    if (!hasInitializedRef.current || reducedMotion) {
      hasInitializedRef.current = true
      currentTRef.current = toT
      driveRef.current = null
      const lookTarget = stepDrive(controls.camera, toT, 1)
      lookTargetRef.current.copy(lookTarget)
      arriveAndTilt(controls, controls.camera, lookTarget, attraction, true)
      return
    }

    const fromT = currentTRef.current
    if (Math.abs(toT - fromT) < 1e-6) {
      // Already parked here (re-clicking the current stop) — just re-tilt.
      arriveAndTilt(controls, controls.camera, lookTargetRef.current, attraction, !reducedMotion)
      return
    }

    driveRef.current = {
      fromT,
      toT,
      direction: toT > fromT ? 1 : -1,
      startTime: performance.now(),
      duration: driveDuration(fromT, toT) * 1000,
      attractionId: attraction.id,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttractionId, reducedMotion])

  useFrame(() => {
    const drive = driveRef.current
    const controls = controlsRef.current
    if (!drive || !controls) return

    const elapsed = performance.now() - drive.startTime
    const progress = Math.min(1, elapsed / drive.duration)
    const eased = easeInOutCubic(progress)
    const t = drive.fromT + (drive.toT - drive.fromT) * eased

    const lookTarget = stepDrive(controls.camera, t, drive.direction)
    currentTRef.current = t
    lookTargetRef.current.copy(lookTarget)

    if (progress >= 1) {
      driveRef.current = null
      const attraction = getAttraction(drive.attractionId)
      if (attraction) arriveAndTilt(controls, controls.camera, lookTarget, attraction, reducedMotion)
    }
  })

  return <CameraControls ref={controlsRef} makeDefault smoothTime={CAMERA.smoothTime} restThreshold={CAMERA.restThreshold} />
}
