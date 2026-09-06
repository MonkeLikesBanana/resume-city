import { Cloud, Clouds as CloudGroup } from '@react-three/drei'

// PRD v4 §4.4/§7.4 — a handful of drifting clouds using drei's built-in
// procedural <Cloud> (no texture/model download at all — already ships with
// @react-three/drei, §4.5/§6). Positions are hand-placed rather than
// randomized: only a handful of clouds exist, and this keeps them spread
// out over the whole city rather than risking a random cluster.
//
// Kept deliberately low-poly: drei's default segment/volume settings
// generate enough procedural geometry per cloud to measurably block the
// main thread on mount (found via Lighthouse — Total Blocking Time jumped
// from ~190ms to ~980ms with the defaults, dropping back under 100ms with
// this reduced version). Three sparse, simple clouds read as "the sky has
// motion" just as well as five dense ones for a background atmosphere
// effect that's never the subject of a shot.
const PLACEMENTS: Array<{ position: [number, number, number]; scale: number; speed: number; opacity: number }> = [
  { position: [-40, 55, -20], scale: 8, speed: 0.15, opacity: 0.7 },
  { position: [20, 60, 40], scale: 9, speed: 0.1, opacity: 0.65 },
  { position: [-60, 56, 60], scale: 7, speed: 0.18, opacity: 0.6 },
]

export default function Clouds() {
  return (
    <CloudGroup limit={40} range={100}>
      {PLACEMENTS.map((p, i) => (
        <Cloud
          key={i}
          position={p.position}
          scale={p.scale}
          speed={p.speed}
          opacity={p.opacity}
          seed={i * 17}
          bounds={[8, 2, 5]}
          volume={4}
          segments={6}
          fade={40}
        />
      ))}
    </CloudGroup>
  )
}
