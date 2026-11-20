import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE } from '../../config'

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
    #include <colorspace_fragment>
  }
`

export default function Sky() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color(PALETTE.skyTop) },
      bottomColor: { value: new THREE.Color(PALETTE.skyBottom) },
      offset: { value: 20 },
      exponent: { value: 0.6 },
    }),
    [],
  )

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
