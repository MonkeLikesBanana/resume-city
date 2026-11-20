/** Build the court from primitives so its scale and markings match the neighborhood. */
const CENTER: [number, number] = [-32, 65]
const [cx, cz] = CENTER
const LENGTH = 16
const WIDTH = 9
const LINE_H = 0.03
const LINE_Y = 0.025

function BoundaryLine({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  return (
    <mesh position={[cx + x, LINE_Y, cz + z]}>
      <boxGeometry args={[w, LINE_H, d]} />
      <meshStandardMaterial color="#f4f1ea" />
    </mesh>
  )
}

function Hoop({ z, facing }: { z: number; facing: 1 | -1 }) {
  return (
    <group position={[cx, 0, cz + z]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
        <meshStandardMaterial color="#3a3a3f" />
      </mesh>
      <mesh position={[0, 3.0, 0.35 * facing]} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.06]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh position={[0, 2.75, 0.55 * facing]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.03, 8, 16]} />
        <meshStandardMaterial color="#c97b4a" />
      </mesh>
    </group>
  )
}

export default function BasketballCourt() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.01, cz]} receiveShadow>
        <planeGeometry args={[WIDTH, LENGTH]} />
        <meshStandardMaterial color="#4a4a52" roughness={0.95} />
      </mesh>

      {/* Perimeter */}
      <BoundaryLine x={0} z={LENGTH / 2} w={WIDTH} d={0.08} />
      <BoundaryLine x={0} z={-LENGTH / 2} w={WIDTH} d={0.08} />
      <BoundaryLine x={WIDTH / 2} z={0} w={0.08} d={LENGTH} />
      <BoundaryLine x={-WIDTH / 2} z={0} w={0.08} d={LENGTH} />

      {/* Center line + circle */}
      <BoundaryLine x={0} z={0} w={WIDTH} d={0.08} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, LINE_Y, cz]}>
        <ringGeometry args={[1.7, 1.78, 32]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>

      {/* Keys at each end */}
      <BoundaryLine x={0} z={LENGTH / 2 - 2.2} w={4.4} d={0.08} />
      <BoundaryLine x={0} z={-(LENGTH / 2 - 2.2)} w={4.4} d={0.08} />
      <BoundaryLine x={2.2} z={LENGTH / 4} w={0.08} d={LENGTH / 2 - 2.2} />
      <BoundaryLine x={-2.2} z={LENGTH / 4} w={0.08} d={LENGTH / 2 - 2.2} />
      <BoundaryLine x={2.2} z={-LENGTH / 4} w={0.08} d={LENGTH / 2 - 2.2} />
      <BoundaryLine x={-2.2} z={-LENGTH / 4} w={0.08} d={LENGTH / 2 - 2.2} />

      <Hoop z={LENGTH / 2 + 0.4} facing={-1} />
      <Hoop z={-(LENGTH / 2 + 0.4)} facing={1} />
    </group>
  )
}
