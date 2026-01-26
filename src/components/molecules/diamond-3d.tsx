import type * as THREE from "three";

import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

interface DiamondProps {
  position?: [number, number, number];
  scale?: [number, number, number];
}

export default function Diamond3D(): React.JSX.Element {
  return (
    <div className="size-full">
      <Canvas camera={{ fov: 35, position: [0, 0, 7] }}>
        <ambientLight intensity={0.01} />

        {/* Powerful Multi-directional Highlights */}
        <spotLight angle={0.15} color="#ffffff" intensity={60} penumbra={1} position={[0, 10, 5]} />

        {/* Vibrant accent lights for "sparkle" */}
        <pointLight color="#00d2ff" intensity={25} position={[5, 2, 5]} />
        <pointLight color="#ff00ff" intensity={20} position={[-5, -2, 5]} />
        <pointLight color="#10b981" intensity={15} position={[0, 5, -5]} />
        <pointLight color="#3b82f6" intensity={15} position={[3, -5, 2]} />

        <Float
          floatingRange={[-0.1, 0.1]}
          floatIntensity={0.3}
          rotationIntensity={0.2}
          speed={1.5}
        >
          <Diamond position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]} />
        </Float>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

const Diamond = ({ scale = [1, 1, 1], ...props }: DiamondProps): React.JSX.Element => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
  });

  const outerMaterial = {
    attenuationColor: "#00d2ff",
    attenuationDistance: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    color: "#f0f9ff",
    emissive: "#00d2ff",
    emissiveIntensity: 0.1,
    ior: 2.42,
    iridescence: 1,
    iridescenceIOR: 1.7,
    reflectivity: 1,
    roughness: 0,
    sheen: 1,
    sheenColor: "#ffffff",
    thickness: 2.5,
    transmission: 1,
  };

  const innerMaterial = {
    clearcoat: 1,
    color: "#ff00ff", // Magenta core
    emissive: "#8b5cf6", // Violet glow
    emissiveIntensity: 0.5,
    ior: 1.5,
    reflectivity: 1,
    roughness: 0,
    thickness: 1,
    transmission: 1,
  };

  return (
    <group ref={groupRef} {...props} scale={scale}>
      {/* Outer facets - 16 segments for more faces */}
      <group>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[1, 1.2, 16]} />
          <meshPhysicalMaterial {...outerMaterial} />
        </mesh>
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1, 1.6, 16]} />
          <meshPhysicalMaterial {...outerMaterial} />
        </mesh>
      </group>

      {/* Inner colorful core */}
      <group scale={[0.4, 0.5, 0.4]}>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[1, 1.2, 8]} />
          <meshPhysicalMaterial {...innerMaterial} />
        </mesh>
        <mesh position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1, 1.6, 8]} />
          <meshPhysicalMaterial {...innerMaterial} />
        </mesh>
      </group>
    </group>
  );
};
