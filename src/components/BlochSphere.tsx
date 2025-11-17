import { Text, OrbitControls, Line } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

const BlochSphere = () => {
	const radius = 2;
	// default values to 90 deg
	const theta = 45 * Math.PI / 180;
	const phi = 90 * Math.PI / 180;
	// spherical coords
	const x = radius * Math.sin(theta) * Math.cos(phi);
	const y = radius * Math.sin(theta) * Math.sin(phi);
	const z = radius * Math.cos(theta);
	console.log(x, y, z);

  return (
    <>
			<div className="border border-black/20 rounded-lg place-content-center bg-white h-full">
				<Canvas frameloop='demand'>
			  	{/* Light */}
			  	<ambientLight />
			  	<directionalLight />
					{/* Axes: x = red, y = green, z = blue */}
					<Line 
						points={[
							[0, 0, 0],
							[2, 0, 0],
						]}
						color="red"
			  		transparent
						lineWidth={2}
					/>
					<Line 
						points={[
							[0, 0, 0],
							[0, 2, 0],
						]}
						color="green"
			  		transparent
						lineWidth={2}
					/>
					<Line 
						points={[
							[0, 0, 0],
							[0, 0, 2],
						]}
						color="blue"
			  		transparent
						lineWidth={2}
					/>
			  	{/* Main Sphere/Qubit */}
			  	<mesh>
			  		<sphereGeometry args={[radius, 64, 64]}/>
			  		<meshStandardMaterial
							wireframe
							wireframeLinewidth={0.5}
			  			transparent
							opacity={.3}
			  			color="#fff"
			  		/>
			  	</mesh> 
					{/* 3 rings */}
					<mesh rotation={[Math.PI / 2, 0, 0]}>
						<torusGeometry args={[2, 0.02, 16, 128]} />
						<meshStandardMaterial 
							color={"white"}
							opacity={.5}
						/>
					</mesh>
					<mesh 
						position={[0, 1, 0]}
						rotation={[Math.PI / 2, 0, 0]}>
						<torusGeometry args={[1.75, 0.02, 16, 128]} />
						<meshStandardMaterial 
							color={"black"}
							opacity={.5}
						/>
					</mesh>
					<mesh 
						position={[0, -1, 0]}
						rotation={[Math.PI / 2, 0, 0]}>
						<torusGeometry args={[1.75, 0.02, 16, 128]} />
						<meshStandardMaterial 
							color={"black"}
							opacity={.5}
						/>
					</mesh>
					{/* Tip of the Bloch State */}
					<mesh position={[0, 2, 0]}>
			  		<sphereGeometry args={[0.06, 12, 12]}/>
			  		<meshStandardMaterial
			  			color="green"
			  		/>
			  	</mesh> 
					{/* Bottom tip of the Sphere */}
					<mesh position={[0, -2, 0]}>
			  		<sphereGeometry args={[0.06, 12, 12]}/>
			  		<meshStandardMaterial
			  			color="orange"
			  		/>
			  	</mesh> 
					{/* Bloch state vector */}
					<Line 
						points={[
							[0, 0, 0],
							[x, y, z],
						]}
						color="yellow"
			  		transparent
						lineWidth={2}
					/>
					{/* Tip of the Bloch state vector*/}
					<mesh position={[x, y, z]}>
			  		<sphereGeometry args={[0.06, 12, 12]}/>
			  		<meshStandardMaterial
			  			color="yellow"
			  		/>
			  	</mesh> 
					{/* Labels */}
					<Text
						position={[x + 0.2, y + 0.2, z + 0.2]}
						fontSize={0.25}
						color="black"
						anchorX="center"
						anchorY="top"
					>
					{/* sample state */}
					|0000&gt;
					</Text>
			  	<OrbitControls enablePan={false} enableZoom={true}/>
			  </Canvas>
    	</div>
    </>
  )
}

export default BlochSphere