import { useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { NeutralToneMapping, Object3D } from 'three'
import useIsMobile from '../../hooks/useIsMobile'
import CameraRig from './CameraRig'
import HideCanvasFromAT from './HideCanvasFromAT'
import WebGLContextLossWatcher from './WebGLContextLossWatcher'
import { MODEL_PALETTE } from './massing'
import { MODEL_FOV } from './modelCamera'

interface CityCanvasProps {
  initialStopId: string
  panelHeight?: number
  children: ReactNode
  onReady: (ready: boolean) => void
}

export default function CityCanvas({ children, initialStopId, panelHeight, onReady }: CityCanvasProps) {
  const isMobile = useIsMobile()
  const [reducedDensity, setReducedDensity] = useState(false)
  const maxDpr = reducedDensity ? 1 : isMobile ? 1.25 : 1.5

  const [sunTarget] = useState(() => {
    const target = new Object3D()
    target.position.set(-25, 0, -1)
    return target
  })

  useEffect(() => {
    onReady(true)
    return () => onReady(false)
  }, [onReady])

  return (
    <Canvas
      frameloop="demand"
      shadows="percentage"
      dpr={[1, maxDpr]}
      gl={{ toneMapping: NeutralToneMapping, toneMappingExposure: 1, antialias: true }}
      camera={{ fov: MODEL_FOV, near: .3, far: 260 }}
    >
      {!isMobile && !reducedDensity && <PerformanceMonitor onDecline={() => setReducedDensity(true)} />}
      <color attach="background" args={[MODEL_PALETTE.background]} />
      <fog attach="fog" args={[MODEL_PALETTE.background, 55, 140]} />
      <hemisphereLight args={['#ffffff', '#e3e0d9', 1.35]} />
      <primitive object={sunTarget} />
      <directionalLight
        position={[-52, 47, 54]}
        target={sunTarget}
        color="#fff9f0"
        intensity={1.65}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-62}
        shadow-camera-right={62}
        shadow-camera-top={52}
        shadow-camera-bottom={-52}
        shadow-camera-near={.5}
        shadow-camera-far={164}
        shadow-normalBias={.045}
        shadow-autoUpdate={false}
        shadow-needsUpdate
      />

      <HideCanvasFromAT />
      <WebGLContextLossWatcher />
      <CameraRig initialStopId={initialStopId} panelHeight={panelHeight} />
      {children}
    </Canvas>
  )
}
