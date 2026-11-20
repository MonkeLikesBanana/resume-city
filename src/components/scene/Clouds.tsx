import { Cloud, Clouds as CloudGroup } from '@react-three/drei'
import { MeshBasicMaterial } from 'three'

class UnlitCloudMaterial extends MeshBasicMaterial {
  constructor(parameters?: ConstructorParameters<typeof MeshBasicMaterial>[0]) {
    super(parameters)
    this.fog = false
  }
}

const CLOUD_TEXTURE = '/assets/cloud-puff.png'

const PLACEMENTS: Array<{ position: [number, number, number]; scale: number; speed: number; opacity: number }> = [
  { position: [-40, 145, -20], scale: 8, speed: 0.15, opacity: 0.7 },
  { position: [20, 155, 40], scale: 9, speed: 0.1, opacity: 0.65 },
  { position: [-60, 148, 60], scale: 7, speed: 0.18, opacity: 0.6 },
]

export default function Clouds() {
  return (
    <CloudGroup texture={CLOUD_TEXTURE} material={UnlitCloudMaterial} limit={40} range={100}>
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
