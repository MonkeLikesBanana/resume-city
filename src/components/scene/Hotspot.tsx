import { Html } from '@react-three/drei'
import type { Attraction } from '../../types/attraction'
import Building from './Building'
import useCityStore from '../../store/useCityStore'
import { ACCENT_FILL } from '../../config'

interface HotspotProps {
  attraction: Attraction
}

/** PRD v4 §7.6 — a building (or, for the placeholder lot, a couple of decor
 * props) plus a title label. The label renders if and only if this is the
 * currently active stop — no proximity/heading visibility gate anymore
 * (v2/v3's whole point was hiding *distant* markers; v4's point is hiding
 * *every* marker except the one you've actually arrived at, since nothing
 * in a real city announces its name from three blocks away). It's a plain
 * label now, not a button: you only ever see it once you're already here,
 * so it's never itself a navigation target — AccessibleNav (§10) remains
 * the guaranteed-reachable path to every stop regardless of camera state. */
export default function Hotspot({ attraction }: HotspotProps) {
  const active = useCityStore((s) => s.activeAttractionId === attraction.id)
  const markerHeight = attraction.height + 1.5
  const [x, y, z] = attraction.position

  return (
    <group>
      {attraction.model ? (
        <Building model={attraction.model} position={attraction.position} rotationY={attraction.rotationY} scale={attraction.scale} glowAtNight />
      ) : (
        <>
          <Building model="/assets/models/construction-barrier.glb" position={[x - 1, y, z]} scale={2.5} />
          <Building model="/assets/models/construction-cone.glb" position={[x + 1, y, z + 0.5]} scale={2.5} />
        </>
      )}

      {active && (
        <Html position={[x, y + markerHeight, z]} center distanceFactor={26} occlude={false}>
          <span
            className="flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-md"
            style={{
              background: ACCENT_FILL[attraction.accentColor],
              borderColor: ACCENT_FILL[attraction.accentColor],
              color: '#1F2A24',
            }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#1F2A24]/70" />
            {attraction.name}
          </span>
        </Html>
      )}
    </group>
  )
}
