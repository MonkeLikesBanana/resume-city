import { Cloud, Clouds as CloudGroup } from '@react-three/drei'

// PRD v4 §4.4/§7.4 — a handful of drifting clouds using drei's built-in
// procedural <Cloud> (no texture/model download at all — already ships with
// @react-three/drei, §4.5/§6). Positions are hand-placed rather than
// randomized: only a handful of clouds exist, and this keeps them spread
// out over the whole city rather than risking a random cluster.
const PLACEMENTS: Array<{ position: [number, number, number]; scale: number; speed: number; opacity: number }> = [
  { position: [-40, 55, -20], scale: 9, speed: 0.15, opacity: 0.75 },
  { position: [10, 62, 30], scale: 11, speed: 0.1, opacity: 0.7 },
  { position: [-70, 58, 40], scale: 8, speed: 0.18, opacity: 0.65 },
  { position: [30, 50, -50], scale: 10, speed: 0.12, opacity: 0.7 },
  { position: [-10, 65, 80], scale: 9, speed: 0.14, opacity: 0.7 },
]

export default function Clouds() {
  return (
    <CloudGroup limit={200} range={100}>
      {PLACEMENTS.map((p, i) => (
        <Cloud key={i} position={p.position} scale={p.scale} speed={p.speed} opacity={p.opacity} seed={i * 17} bounds={[10, 3, 6]} volume={8} fade={40} />
      ))}
    </CloudGroup>
  )
}
