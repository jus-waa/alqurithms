import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

const BlochSphere = () => {
  return (
    <>
			<div className="border border-black/20 rounded-lg place-content-center bg-white h-full">
				<Canvas frameloop='demand'>
			  	{/* Light */}
			  	<ambientLight />
			  	<directionalLight />
			  	{/* Sphere */}
			  	<mesh>
			  		<sphereGeometry args={[2, 16, 16]}/>
			  		<meshStandardMaterial
			  			wireframe
			  			opacity={0.3}
			  			transparent
			  			color="#ffffff"
			  		/>
			  	</mesh> 
					{/* incase need ng axis */}
					{/* <group>
						<axesHelper args={[1.2]} />
					</group> */}
			  	{/* Allows rotation */}
			  	<OrbitControls enablePan={false} enableZoom={true}/>
			  </Canvas>
    	</div>
    </>
  )
}

export default BlochSphere