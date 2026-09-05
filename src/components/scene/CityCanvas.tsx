import { Suspense, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { PALETTE, OVERVIEW_SHOT } from '../../config'
import useIsMobile from '../../hooks/useIsMobile'
import Sky from './Sky'
import Ground from './Ground'
import CameraRig from './CameraRig'
import HideCanvasFromAT from './HideCanvasFromAT'
import WebGLContextLossWatcher from './WebGLContextLossWatcher'

interface CityCanvasProps {
  children?: ReactNode
}

/** PRD §7.2/§9/§11/§12 — Canvas root: perspective camera (§7.2 — not
 * orthographic), lighting, fog, and the adaptive quality ladder. Shadow map
 * resolution is capped lower on mobile from the start (§11 — "not just as a
 * PerformanceMonitor reaction"); PerformanceMonitor then downgrades further
 * — shadows off, then dpr to 1 — if FPS stays low on ANY device. This is a
 * one-way ratchet: it only ever downgrades, never re-enables mid-session,
 * to avoid visibly flickering quality up and down. */
export default function CityCanvas({ children }: CityCanvasProps) {
  const isMobile = useIsMobile()
  const [shadowsEnabled, setShadowsEnabled] = useState(true)
  const [dpr, setDpr] = useState<[number, number]>(isMobile ? [1, 1.5] : [1, 2])

  return (
    <Canvas
      shadows={shadowsEnabled}
      dpr={dpr}
      camera={{
        position: OVERVIEW_SHOT.cameraPosition,
        fov: 42,
        near: 0.5,
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
      <fog attach="fog" args={[PALETTE.skyBottom, 70, 260]} />

      <hemisphereLight args={['#fff6e8', PALETTE.evergreen, 0.55]} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.7}
        castShadow={shadowsEnabled}
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={150}
      />

      <Sky />
      <HideCanvasFromAT />
      <WebGLContextLossWatcher />
      <CameraRig />
      <Suspense fallback={null}>
        <Ground />
        {children}
      </Suspense>
    </Canvas>
  )
}
