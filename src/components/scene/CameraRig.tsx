import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { nearestPositionOnArm, buildTripCurve, ARM_CURVES, type TripCurve } from '../../lib/roadGraph'
import { driveFrame, snapTo, driveDuration } from '../../lib/camera'
import { HOME_ATTRACTION_ID, DEFAULT_FOV, HOME_FOV } from '../../config'
import useReducedMotion from '../../hooks/useReducedMotion'
import type { Attraction, RoadPosition } from '../../types/attraction'

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

function curbFor(attraction: Attraction): RoadPosition {
  return attraction.curb ?? nearestPositionOnArm(attraction.district, attraction.position)
}

function roadPositionsEqual(a: RoadPosition, b: RoadPosition): boolean {
  return a.arm === b.arm && Math.abs(a.t - b.t) < 1e-6
}

function targetFovFor(id: string): number {
  return id === HOME_ATTRACTION_ID ? HOME_FOV : DEFAULT_FOV
}

interface DriveState {
  curve: TripCurve
  startTime: number
  duration: number
  attractionId: string
  startFov: number
  targetFov: number
}

/** PRD v3 §7.3/§9 — the only component that writes to the camera directly.
 * No CameraControls dependency (§6) — every trip, home included (the Plaza
 * is modeled as its own short arm, src/content/road.ts), is one continuous
 * drive handled by driveFrame(); there is no second phase to hand off to. */
export default function CameraRig() {
  const { camera } = useThree()
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const reducedMotion = useReducedMotion()

  const currentCurbRef = useRef<RoadPosition | null>(null)
  const driveRef = useRef<DriveState | null>(null)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    const targetId = activeAttractionId ?? HOME_ATTRACTION_ID
    const attraction = getAttraction(targetId)
    if (!attraction) return
    const perspCamera = camera as THREE.PerspectiveCamera
    const toCurb = curbFor(attraction)

    if (!hasInitializedRef.current || reducedMotion) {
      hasInitializedRef.current = true
      currentCurbRef.current = toCurb
      driveRef.current = null
      perspCamera.fov = targetFovFor(targetId)
      perspCamera.updateProjectionMatrix()
      snapTo(perspCamera, ARM_CURVES[toCurb.arm].getPointAt(toCurb.t), attraction)
      return
    }

    const fromCurb = currentCurbRef.current
    if (fromCurb && roadPositionsEqual(fromCurb, toCurb)) return // already parked here — nothing to do

    const curve = buildTripCurve(fromCurb ?? toCurb, toCurb)
    driveRef.current = {
      curve,
      startTime: performance.now(),
      duration: driveDuration(curve.getLength()) * 1000,
      attractionId: attraction.id,
      startFov: perspCamera.fov,
      targetFov: targetFovFor(targetId),
    }
    currentCurbRef.current = toCurb
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttractionId, reducedMotion])

  useFrame((_, delta) => {
    const drive = driveRef.current
    if (!drive) return
    const perspCamera = camera as THREE.PerspectiveCamera

    const elapsed = performance.now() - drive.startTime
    const rawProgress = Math.min(1, elapsed / drive.duration)
    const eased = easeInOutCubic(rawProgress)

    const attraction = getAttraction(drive.attractionId)
    if (!attraction) {
      driveRef.current = null
      return
    }

    driveFrame(perspCamera, drive.curve, eased, attraction, delta)
    perspCamera.fov = THREE.MathUtils.lerp(drive.startFov, drive.targetFov, eased)
    perspCamera.updateProjectionMatrix()

    if (rawProgress >= 1) {
      driveRef.current = null
      // Hard-correct the final frame — eliminates any residual slerp error
      // so the parked framing is always exact, never "almost caught up."
      snapTo(perspCamera, drive.curve.getPointAt(1), attraction)
    }
  })

  return null
}
