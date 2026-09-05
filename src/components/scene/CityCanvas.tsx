import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PALETTE, OVERVIEW_SHOT } from '../../config'
import Sky from './Sky'
import Ground from './Ground'
import CameraRig from './CameraRig'
import HideCanvasFromAT from './HideCanvasFromAT'

interface CityCanvasProps {
  children?: ReactNode
  dpr?: [number, number]
}

/** PRD §7.2/§9 — Canvas root: perspective camera (not orthographic — see
 * §7.2 for why), lighting, fog. This is the only place scene-wide render
 * settings live. */
export default function CityCanvas({ children, dpr = [1, 2] }: CityCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{
        position: OVERVIEW_SHOT.cameraPosition,
        fov: 42,
        near: 0.5,
        far: 500,
      }}
    >
      <color attach="background" args={[PALETTE.skyBottom]} />
      <fog attach="fog" args={[PALETTE.skyBottom, 70, 260]} />

      <hemisphereLight args={['#fff6e8', PALETTE.evergreen, 0.55]} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={150}
      />

      <Sky />
      <HideCanvasFromAT />
      <CameraRig />
      <Suspense fallback={null}>
        <Ground />
        {children}
      </Suspense>
    </Canvas>
  )
}
