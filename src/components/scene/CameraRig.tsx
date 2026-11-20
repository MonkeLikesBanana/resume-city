import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { getAttraction } from '../../content/attractions'
import { HOME_ATTRACTION_ID } from '../../config'
import useReducedMotion from '../../hooks/useReducedMotion'
import useCityStore from '../../store/useCityStore'
import { MOVE_SECONDS, poseBetween, stopPose, type ModelPose } from './modelCamera'

interface Move {
  from: ModelPose
  to: ModelPose
  start: number
}

export default function CameraRig({ initialStopId }: { initialStopId: string }) {
  const camera = useThree(state => state.camera)
  const { width, height } = useThree(state => state.size)
  const invalidate = useThree(state => state.invalidate)
  const active = useCityStore(state => state.activeAttractionId)
  const reducedMotion = useReducedMotion()
  const current = useRef<ModelPose | null>(null)
  const move = useRef<Move | null>(null)
  const lastStop = useRef<string | null>(null)

  useLayoutEffect(() => {
    const stop = getAttraction(current.current ? active ?? initialStopId : initialStopId) ?? getAttraction(HOME_ATTRACTION_ID)
    if (!stop || width <= 0 || height <= 0) return
    const next = stopPose(stop, width / height)
    // The moving camera keeps its progress when the details panel changes height.
    if (move.current && !reducedMotion && lastStop.current === stop.id) {
      move.current.to = next
    } else if (!current.current || reducedMotion || lastStop.current === stop.id) {
      current.current = next
      camera.position.copy(next.position)
      camera.lookAt(next.target)
      move.current = null
    } else {
      move.current = { from: current.current, to: next, start: performance.now() }
    }
    lastStop.current = stop.id
    invalidate()
  }, [active, camera, height, initialStopId, invalidate, reducedMotion, width])

  useFrame(() => {
    const flight = move.current
    if (!flight) return
    const progress = Math.min(1, (performance.now() - flight.start) / (MOVE_SECONDS * 1000))
    const pose = poseBetween(flight.from, flight.to, progress)
    current.current = pose
    camera.position.copy(pose.position)
    camera.lookAt(pose.target)
    if (progress < 1) invalidate()
    else move.current = null
  })

  return null
}
