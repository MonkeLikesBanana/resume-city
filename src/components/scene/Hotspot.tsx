import { Html } from '@react-three/drei'
import type { Attraction } from '../../types/attraction'
import Building from './Building'
import useCityStore from '../../store/useCityStore'

const ACCENT_HEX: Record<Attraction['accentColor'], string> = {
  foundry: '#2EC4B6',
  lakeside: '#C97B4A',
}

interface HotspotProps {
  attraction: Attraction
}

/** PRD §7.4 — a building (or, for the placeholder lot, a couple of decor
 * props) plus a floating marker. The marker is a real <button> (via drei's
 * <Html>) so it's independently clickable/focusable — but per §10 it is
 * NOT the only way to reach this stop; AccessibleNav (Phase 4) is the
 * guaranteed-reachable path regardless of whether the canvas rendered. */
export default function Hotspot({ attraction }: HotspotProps) {
  const setActive = useCityStore((s) => s.setActiveAttractionId)
  const active = useCityStore((s) => s.activeAttractionId === attraction.id)
  const markerHeight = (attraction.footprint ?? 6) * 0.9 + 2
  const [x, y, z] = attraction.position

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

      <Html position={[x, y + markerHeight, z]} center distanceFactor={26} occlude={false}>
        <button
          type="button"
          onClick={() => setActive(attraction.id)}
          aria-label={`Fly to ${attraction.name}`}
          className="flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-md transition-transform hover:scale-105 focus-visible:scale-105 cursor-pointer"
          style={{
            background: active ? ACCENT_HEX[attraction.accentColor] : 'rgba(244,241,234,0.92)',
            borderColor: ACCENT_HEX[attraction.accentColor],
            color: active ? '#1F2A24' : '#1F2A24',
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: ACCENT_HEX[attraction.accentColor] }}
          />
          {attraction.name}
        </button>
      </Html>
    </group>
  )
}
