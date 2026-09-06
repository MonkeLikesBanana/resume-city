import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { computeDayNight } from '../../lib/dayNight'

const VERTEX = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition + offset).y;
    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
  }
`

/** PRD §4/§7.2 — two-stop sky gradient as a simple sky-dome shader (a large
 * BackSide sphere), instead of pulling in drei's <Sky> physical-sky model —
 * this scene wants a flat two-color gradient, not a real sun/atmosphere
 * simulation. PRD v4 §7.4 — the two colors are now driven by the day/night
 * cycle every frame; this is the one component that actually paints the
 * visible sky (scene.background is a fallback behind the dome, essentially
 * never seen), so it owns its own color animation directly rather than
 * receiving it through a ref from elsewhere. */
export default function Sky() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color() },
      bottomColor: { value: new THREE.Color() },
      offset: { value: 20 },
      exponent: { value: 0.6 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const frame = computeDayNight(clock.getElapsedTime())
    uniforms.topColor.value.copy(frame.skyTop)
    uniforms.bottomColor.value.copy(frame.skyBottom)
  })

  return (
    <mesh>
      <sphereGeometry args={[400, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
