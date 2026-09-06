import { Suspense, useState, useRef, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import type * as THREE from 'three'
import { PALETTE, CAR_EYE_HEIGHT, DEFAULT_FOV } from '../../config'
import useIsMobile from '../../hooks/useIsMobile'
import Sky from './Sky'
import Ground from './Ground'
import CameraRig from './CameraRig'
import DayNightCycle from './DayNightCycle'
import Clouds from './Clouds'
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
 * to avoid visibly flickering quality up and down. PRD v4 §7.4 — sun/
 * hemisphere color+intensity are no longer fixed props: DayNightCycle
 * mutates them via refs every frame, so the initial values here are just a
 * starting pose (overwritten before the first visible frame). */
export default function CityCanvas({ children }: CityCanvasProps) {
  const isMobile = useIsMobile()
  const [shadowsEnabled, setShadowsEnabled] = useState(true)
  const [dpr, setDpr] = useState<[number, number]>(isMobile ? [1, 1.5] : [1, 2])
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const hemisphereRef = useRef<THREE.HemisphereLight>(null)

  return (
    <Canvas
      shadows={shadowsEnabled}
      dpr={dpr}
      camera={{
        // Placeholder pose only — CameraRig snaps this to the Plaza curb on
        // mount (PRD v3 §7.4), before the visitor ever sees a frame render
        // from here.
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

      <hemisphereLight ref={hemisphereRef} args={['#fff6e8', PALETTE.evergreen, 0.55]} />
      <directionalLight
        ref={sunRef}
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
      <DayNightCycle sunRef={sunRef} hemisphereRef={hemisphereRef} />

      <Sky />
      <Clouds />
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
