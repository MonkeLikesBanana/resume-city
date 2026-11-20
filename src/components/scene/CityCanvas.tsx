import { Suspense, useState, useEffect, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { PALETTE, CAR_EYE_HEIGHT, DEFAULT_FOV } from '../../config'
import useIsMobile from '../../hooks/useIsMobile'
import Sky from './Sky'
import Ground from './Ground'
import CameraRig from './CameraRig'
import Clouds from './Clouds'
import HideCanvasFromAT from './HideCanvasFromAT'
import WebGLContextLossWatcher from './WebGLContextLossWatcher'

interface CityCanvasProps {
  children?: ReactNode
  onReady: (ready: boolean) => void
}

function SceneReady({ onReady }: Pick<CityCanvasProps, 'onReady'>) {
  useEffect(() => {
    onReady(true)
    return () => onReady(false)
  }, [onReady])
  return null
}

export default function CityCanvas({ children, onReady }: CityCanvasProps) {
  const isMobile = useIsMobile()
  const [shadowsEnabled, setShadowsEnabled] = useState(true)
  const [dpr, setDpr] = useState<[number, number]>(isMobile ? [1, 1.5] : [1, 2])

  return (
    <Canvas
      shadows={shadowsEnabled ? 'percentage' : false}
      dpr={dpr}
      camera={{
        // CameraRig supplies the parked pose for the active stop.
        position: [0, CAR_EYE_HEIGHT, 20],
        fov: DEFAULT_FOV,
        near: 0.3,
        far: 500,
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          if (shadowsEnabled) setShadowsEnabled(false)
          else setDpr([1, 1])
        }}
      />
      <color attach="background" args={[PALETTE.skyBottom]} />
      <fog attach="fog" args={[PALETTE.skyBottom, 40, 220]} />

      <hemisphereLight args={['#fff6e8', PALETTE.evergreen, 0.85]} />
      <directionalLight
        color="#fff6e8"
        position={[30, 40, 20]}
        intensity={1.7}
        castShadow={shadowsEnabled}
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={100}
        shadow-camera-bottom={-40}
        shadow-camera-far={220}
      />

      <Sky />
      <HideCanvasFromAT />
      <WebGLContextLossWatcher />
      <CameraRig />
      <Suspense fallback={null}>
        <Clouds />
        <Ground />
        {children}
        <SceneReady onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
