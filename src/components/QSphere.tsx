import { Text, OrbitControls, Line } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Qubit } from '../engine/Qubit';

function binomial(n: number, k: number): number {
  if (k === 0 || k === n) return 1;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res *= (n - i + 1) / i;
  }
  return res;
}

const QSphere = ({ state, qubitCount } : {
  state: Qubit 
  qubitCount: number
}) => {
  const radius = 2;
  const points = state.map((amp, i) => {
    const prob = amp * amp;
    if (prob < 1e-6) return null;
    const bitstring = i.toString(2).padStart(qubitCount, "0");
    const weight = bitstring.split("").filter(b => b === "1").length;
    // Count how many states have this weight
    const count = binomial(qubitCount, weight);
    // Figure out the index of this state among all states with same weight
    const sameWeightIndices = [...Array(2 ** qubitCount).keys()]
      .filter(j => {
        const b = j.toString(2).padStart(qubitCount, "0");
        return b.split("").filter(c => c === "1").length === weight;
      });
    const indexInWeight = sameWeightIndices.indexOf(i);
    const y = radius * (1 - (2 * weight) / qubitCount);
    const rho = Math.sqrt(radius * radius - y * y);
    // Negate phi to reverse the direction (counterclockwise when viewed from top)
    const phi = -(2 * Math.PI * indexInWeight) / count;
    return {
      x: -rho * Math.cos(phi),
      y: y,
      z: rho * Math.sin(phi),
      label: `|${bitstring}⟩`,
      prob
    };
  })
  .filter(
    (p): p is { x: number; y: number; z: number; label: string; prob: number } => p !== null
  );
  {/* Axes 
  <Line points={[[0, 0, 0], [-2, 0, 0]]} color="red" lineWidth={2} />
  <Line points={[[0, 0, 0], [0, 2, 0]]} color="green" lineWidth={2} />
  <Line points={[[0, 0, 0], [0, 0, 2]]} color="blue" lineWidth={2} />
	*/}
  return (
    <>
      <div className="border border-black/20 rounded-lg place-content-center bg-white h-full">
        <Canvas frameloop="demand">
          {/* Lights */}
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />
          {/* Wireframe Q-sphere */}
          <mesh>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial
              wireframe
              transparent
              opacity={0.25}
              color="white"
            />
          </mesh>
          {/* Latitude rings */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2, 0.02, 16, 128]} />
            <meshStandardMaterial color="white" opacity={0.5} />
          </mesh>
          <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.75, 0.02, 16, 128]} />
            <meshStandardMaterial color="white" opacity={0.4} />
          </mesh>
          <mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.75, 0.02, 16, 128]} />
            <meshStandardMaterial color="white" opacity={0.4} />
          </mesh>
          {/* Poles */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="green" />
          </mesh>
          <mesh position={[0, -2, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          {/* Quantum state points */}          
          {points.map((p, i) => (
            <group key={i}>
              {/* Line from center to dot */}
              <Line 
                points={[[0, 0, 0], [p.x, p.y, p.z]]} 
                color="black" 
                lineWidth={4}
              />
              {/* Probability dot */}
              <mesh position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.05 + .1 * p.prob, 12, 12]} />
                <meshStandardMaterial 
                  color="black" 
                  opacity={0.3 + 0.7 * p.prob}
                />
              </mesh>
              {/* Basis label */}
              <Text
                position={[p.x + 0.25, p.y + 0.15, p.z + 0.25]}
                fontSize={0.2}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                {p.label}
              </Text>
            </group>
          ))}
          <OrbitControls enablePan={false} enableZoom />
        </Canvas>
      </div>
    </>
  )
}
export default QSphere;