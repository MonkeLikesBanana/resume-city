import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { TOUR_ORDER } from '../../content/tour'
import { TOUR_CURVE, TOUR_STOP_U, tourIndexFor, nearestTourIndex } from '../../lib/tourCurve'
import { tripProgress, totalTripTime } from '../../lib/motion'
import { driveFrame, scrubFrame, snapTo } from '../../lib/camera'
import { HOME_ATTRACTION_ID, DEFAULT_FOV, HOME_FOV, MAX_SPEED, ACCEL } from '../../config'
import useReducedMotion from '../../hooks/useReducedMotion'

function targetFovFor(id: string): number {
  return id === HOME_ATTRACTION_ID ? HOME_FOV : DEFAULT_FOV
}

function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target
  return current + Math.sign(target - current) * maxDelta
}

interface DriveState {
  startU: number
  targetU: number
  distance: number
  startTime: number
  duration: number
  attractionId: string
  startFov: number
  targetFov: number
}

const SCRUB_KEYS: Record<string, 1 | -1> = { ArrowRight: 1, ArrowLeft: -1 }

function isTypingTarget(el: EventTarget | null): boolean {
  const tag = (el as HTMLElement)?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || Boolean((el as HTMLElement)?.isContentEditable)
}

/** PRD v4 §7.3/§9 — the only component that writes to the camera directly.
 * Tracks one continuous `currentU` along the single shared TOUR_CURVE
 * (src/lib/tourCurve.ts) instead of building a fresh per-trip curve —
 * Next/Prev/direct-jump navigation animates currentU toward a target
 * stop's known TOUR_STOP_U using a real velocity profile (§7.2); holding an
 * arrow key (§7.5) moves currentU continuously instead, taking priority
 * over any in-flight discrete drive. */
export default function CameraRig() {
  const { camera } = useThree()
  const navigate = useNavigate()
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const setActiveAttractionId = useCityStore((s) => s.setActiveAttractionId)
  const reducedMotion = useReducedMotion()

  const currentURef = useRef(0)
  const driveRef = useRef<DriveState | null>(null)
  const hasInitializedRef = useRef(false)

  const scrubHeldDirRef = useRef<1 | -1 | 0>(0)
  const scrubLastDirRef = useRef<1 | -1>(1)
  const scrubSpeedRef = useRef(0)
  const wasScrubbingRef = useRef(false)

  // Explore-yourself: hold → / ← to scrub continuously along TOUR_CURVE (§7.5).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const dir = SCRUB_KEYS[e.key]
      if (!dir) return
      e.preventDefault()
      if (scrubHeldDirRef.current === 0) {
        driveRef.current = null // scrubbing takes over from any in-flight discrete drive
        setActiveAttractionId(null) // entering scrub — hide the title/panel until it settles
      }
      scrubHeldDirRef.current = dir
      scrubLastDirRef.current = dir
    }
    function onKeyUp(e: KeyboardEvent) {
      if (SCRUB_KEYS[e.key] && scrubHeldDirRef.current === SCRUB_KEYS[e.key]) {
        scrubHeldDirRef.current = 0
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [setActiveAttractionId])

  useEffect(() => {
    // null means either "not yet initialized" or "mid-scrub" (transient,
    // set directly via the store above, not through the router) — either
    // way there's nothing for this effect to drive toward yet.
    if (activeAttractionId === null) return
    const attraction = getAttraction(activeAttractionId)
    if (!attraction) return
    const perspCamera = camera as THREE.PerspectiveCamera
    const targetU = TOUR_STOP_U[tourIndexFor(attraction.id)]

    if (!hasInitializedRef.current || reducedMotion) {
      hasInitializedRef.current = true
      currentURef.current = targetU
      driveRef.current = null
      perspCamera.fov = targetFovFor(attraction.id)
      perspCamera.updateProjectionMatrix()
      snapTo(perspCamera, TOUR_CURVE.getPointAt(targetU), attraction)
      return
    }

    const startU = currentURef.current
    if (Math.abs(startU - targetU) < 1e-6) return // already here

    const distance = Math.abs(targetU - startU) * TOUR_CURVE.getLength()
    driveRef.current = {
      startU,
      targetU,
      distance,
      startTime: performance.now(),
      duration: totalTripTime(distance) * 1000,
      attractionId: attraction.id,
      startFov: perspCamera.fov,
      targetFov: targetFovFor(attraction.id),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttractionId, reducedMotion])

  useFrame((_, delta) => {
    const perspCamera = camera as THREE.PerspectiveCamera
    const heldDir = scrubHeldDirRef.current

    // --- Explore-yourself scrub owns the frame whenever it's active or
    // still decelerating after a release. ---
    if (heldDir !== 0 || scrubSpeedRef.current > 0.01) {
      wasScrubbingRef.current = true
      const targetSpeed = heldDir !== 0 ? MAX_SPEED : 0
      const rampDelta = reducedMotion ? MAX_SPEED : ACCEL * delta
      scrubSpeedRef.current = moveTowards(scrubSpeedRef.current, targetSpeed, rampDelta)

      const dir = scrubLastDirRef.current
      const deltaU = (dir * scrubSpeedRef.current * delta) / TOUR_CURVE.getLength()
      currentURef.current = THREE.MathUtils.clamp(currentURef.current + deltaU, 0, 1)
      scrubFrame(perspCamera, TOUR_CURVE, currentURef.current, dir, delta)

      if (heldDir === 0 && scrubSpeedRef.current <= 0.01) {
        // Fully coasted to a stop — settle onto the nearest named stop via a
        // normal (usually very short) drive, reusing the same machinery
        // rather than a bespoke "look-only" tween.
        wasScrubbingRef.current = false
        const nearest = TOUR_ORDER[nearestTourIndex(currentURef.current)]
        navigate(`/${nearest.district}/${nearest.id}`)
      }
      return
    }

    const drive = driveRef.current
    if (!drive) return

    const elapsed = (performance.now() - drive.startTime) / 1000
    const localProgress = tripProgress(drive.distance, drive.duration / 1000, elapsed)
    const u = THREE.MathUtils.lerp(drive.startU, drive.targetU, localProgress)
    const direction: 1 | -1 = drive.targetU >= drive.startU ? 1 : -1
    currentURef.current = u // keep truthful every frame, not just at completion — a scrub key pressed mid-drive cancels driveRef and must resume from here, not from wherever the drive started

    const attraction = getAttraction(drive.attractionId)
    if (!attraction) {
      driveRef.current = null
      return
    }

    driveFrame(perspCamera, TOUR_CURVE, u, direction, localProgress, attraction, delta)
    perspCamera.fov = THREE.MathUtils.lerp(drive.startFov, drive.targetFov, localProgress)
    perspCamera.updateProjectionMatrix()

    if (localProgress >= 1) {
      driveRef.current = null
      currentURef.current = drive.targetU
      // Hard-correct the final frame — eliminates any residual slerp error
      // so the parked framing is always exact, never "almost caught up."
      snapTo(perspCamera, TOUR_CURVE.getPointAt(drive.targetU), attraction)
    }
  })

  return null
}
