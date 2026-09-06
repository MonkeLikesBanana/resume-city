import { useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import type { Attraction } from '../../types/attraction'
import Building from './Building'
import useCityStore from '../../store/useCityStore'
import { ACCENT_FILL } from '../../config'

// PRD v2 §7.4 — with the city now spanning a 140+ unit Main Street instead of
// v1's compact aerial-view footprint, every marker being visible from every
// point on the road reads as clutter (and drei's Html only hides markers
// truly *behind* the camera, not ones merely far outside the FOV cone — so
// distant markers can still render at odd screen positions). Gate rendering
// on distance instead, checked a few times a second rather than every frame.
const MAX_MARKER_DISTANCE = 45
const VISIBILITY_CHECK_INTERVAL = 0.2 // seconds

interface HotspotProps {
  attraction: Attraction
}

/** PRD §7.4 — a building (or, for the placeholder lot, a couple of decor
 * props) plus a floating marker. The marker is a real <button> (via drei's
 * <Html>) so it's independently clickable/focusable — but per §10 it is
 * NOT the only way to reach this stop; AccessibleNav (Phase 4) is the
 * guaranteed-reachable path regardless of whether the canvas rendered. */
export default function Hotspot({ attraction }: HotspotProps) {
  const navigate = useNavigate()
  const active = useCityStore((s) => s.activeAttractionId === attraction.id)
  const markerHeight = attraction.height + 1.5
  const [x, y, z] = attraction.position

  const camera = useThree((s) => s.camera)
  const [isNear, setIsNear] = useState(true)
  const elapsedRef = useRef(0)
  const forwardRef = useRef(new THREE.Vector3())
  const toAttractionRef = useRef(new THREE.Vector3())
  const markerWorldPos = useMemo(() => new THREE.Vector3(x, y + markerHeight, z), [x, y, z, markerHeight])

  useFrame((_, delta) => {
    elapsedRef.current += delta
    if (elapsedRef.current < VISIBILITY_CHECK_INTERVAL) return
    elapsedRef.current = 0

    const dx = camera.position.x - x
    const dz = camera.position.z - z
    const withinDistance = dx * dx + dz * dz < MAX_MARKER_DISTANCE * MAX_MARKER_DISTANCE

    // Distance alone isn't enough: drei's Html only hides markers truly
    // *behind* the camera, not ones merely outside the FOV cone, and a
    // nearby-but-behind attraction (e.g. the one just driven away from)
    // still reads as on-screen clutter. Require it to also be roughly in
    // front of the camera's actual look direction.
    camera.getWorldDirection(forwardRef.current)
    toAttractionRef.current.copy(markerWorldPos).sub(camera.position).normalize()
    const isAhead = forwardRef.current.dot(toAttractionRef.current) > 0.15

    const near = withinDistance && isAhead
    setIsNear((prev) => (prev === near ? prev : near))
  })

  return (
    <group>
      {attraction.model ? (
        <Building model={attraction.model} position={attraction.position} rotationY={attraction.rotationY} scale={attraction.scale} />
      ) : (
        <>
          <Building model="/assets/models/construction-barrier.glb" position={[x - 1, y, z]} scale={2.5} />
          <Building model="/assets/models/construction-cone.glb" position={[x + 1, y, z + 0.5]} scale={2.5} />
        </>
      )}

      {isNear && (
        <Html position={[x, y + markerHeight, z]} center distanceFactor={26} occlude={false}>
          <button
            type="button"
            onClick={() => navigate(`/${attraction.district}/${attraction.id}`)}
            aria-label={`Drive to ${attraction.name}`}
            className={`flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-md transition-transform hover:scale-105 focus-visible:scale-105 cursor-pointer ${active ? '' : 'hotspot-marker'}`}
            style={{
              background: active ? ACCENT_FILL[attraction.accentColor] : 'rgba(244,241,234,0.92)',
              borderColor: ACCENT_FILL[attraction.accentColor],
              color: '#1F2A24',
              animationDelay: `${(attraction.id.charCodeAt(0) % 12) * 0.2}s`,
            }}
          >
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: ACCENT_FILL[attraction.accentColor] }} />
            {attraction.name}
          </button>
        </Html>
      )}
    </group>
  )
}
