import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

const BlochSphere = () => {
  return (
    <>
    <div className="border border-black/20 rounded-lg place-content-center bg-white h-full">
		  <Canvas>
		  	{/* Light */}
		  	<ambientLight />
		  	<directionalLight />
		  	{/* Sphere */}
		  	<mesh>
		  		<sphereGeometry args={[2, 16, 16]}/>
		  		<meshStandardMaterial
		  			wireframe
		  			opacity={0.1}
		  			transparent
		  			color="#ffffff"
		  		/>
		  	</mesh> 
		  	{/* Allows rotation */}
		  	<OrbitControls />
		  </Canvas>
    </div>
    </>
  )
}

export default BlochSphere