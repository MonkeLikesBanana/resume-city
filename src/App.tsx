import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { CITY_NAME } from './config'

// PRD §13 Phase 0 — bare Canvas + a real .glb loaded from /public, deployed
// first to confirm the whole pipeline (Vite -> Vercel, incl. binary .glb
// serving) before any real scene/content is built.
function PipelineTestModel() {
  const { scene } = useGLTF('/assets/models/robotics-workshop.glb')
  return <primitive object={scene} rotation={[0, Math.PI / 4, 0]} />
}

export default function App() {
  return (
    <div className="h-full w-full">
      <div className="absolute top-4 left-4 z-10 font-[Fredoka] text-lg text-[var(--color-ink)]">
        {CITY_NAME} — pipeline check
      </div>
      <Canvas camera={{ position: [10, 8, 14], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 3]} intensity={1.2} />
        <Suspense fallback={null}>
          <PipelineTestModel />
        </Suspense>
      </Canvas>
    </div>
  )
}
