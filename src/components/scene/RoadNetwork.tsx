import { useMemo } from 'react'
import Building from './Building'

const TILE = 3 // road-straight.glb is a 1x1 raw tile, scale 3 -> 3x3m

// PRD v2 §4.1/§7.5 — the VISUAL road network: Main Street (matching the
// drivable ROAD_PATH, PRD §7.1) plus two Foundry cross streets for downtown
// grid authenticity. The car only ever drives Main Street (§7.5's scope
// simplification) — the cross streets are set dressing the visual layout
// implies but the route doesn't actually take.
const MAIN_STREET_SPANS: Array<[number, number]> = [
  [-76, -9], // Foundry: gateway to the west bank of the bridge
  [9, 66], // Lakeside: east bank of the bridge to the gateway
]
const CROSS_STREETS_X = [-26, -46]
const CROSS_STREET_Z_SPAN: [number, number] = [-23, 23]

function tilePositions(span: [number, number], axis: 'x' | 'z', fixed: number): Array<[number, number, number]> {
  const [from, to] = span
  const count = Math.round((to - from) / TILE)
  const positions: Array<[number, number, number]> = []
  for (let i = 0; i < count; i++) {
    const t = from + TILE / 2 + i * TILE
    positions.push(axis === 'x' ? [t, 0, fixed] : [fixed, 0, t])
  }
  return positions
}

export default function RoadNetwork() {
  const mainStreetTiles = useMemo(() => MAIN_STREET_SPANS.flatMap((span) => tilePositions(span, 'x', 0)), [])
  const crossStreetTiles = useMemo(
    () => CROSS_STREETS_X.flatMap((x) => tilePositions(CROSS_STREET_Z_SPAN, 'z', x).filter((p) => Math.abs(p[2]) > TILE / 2)),
    [],
  )

  return (
    <group>
      {mainStreetTiles.map((p, i) => (
        <Building key={`main-${i}`} model="/assets/models/road-straight.glb" position={p} scale={TILE} rotationY={Math.PI / 2} />
      ))}
      {crossStreetTiles.map((p, i) => (
        <Building key={`cross-${i}`} model="/assets/models/road-straight.glb" position={p} scale={TILE} />
      ))}
      {CROSS_STREETS_X.map((x) => (
        <Building key={`intersection-${x}`} model="/assets/models/road-crossroad.glb" position={[x, 0, 0]} scale={TILE} />
      ))}
    </group>
  )
}
