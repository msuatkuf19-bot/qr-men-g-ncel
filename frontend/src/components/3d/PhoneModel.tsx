'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import MenuPreview from './MenuPreview';

interface PhoneModelProps {
  scale?: number;
}

export default function PhoneModel({ scale = 1 }: PhoneModelProps) {
  const phoneRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      phoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={phoneRef} scale={scale}>
      {/* Phone Body */}
      <RoundedBox
        args={[2.2, 4.5, 0.2]}
        radius={0.15}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </RoundedBox>

      {/* Phone Frame Border */}
      <RoundedBox
        args={[2.25, 4.55, 0.18]}
        radius={0.16}
        smoothness={4}
        position={[0, 0, -0.02]}
      >
        <meshStandardMaterial
          color="#333333"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.11]}>
        <planeGeometry args={[1.95, 4.2]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Screen Content (HTML) */}
      <Html
        transform
        occlude
        position={[0, 0, 0.12]}
        style={{
          width: '195px',
          height: '420px',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        distanceFactor={1}
      >
        <div style={{ width: '195px', height: '420px', transform: 'scale(1)', transformOrigin: 'top left' }}>
          <MenuPreview />
        </div>
      </Html>

      {/* Camera Notch */}
      <mesh position={[0, 2.0, 0.12]}>
        <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Camera Lens */}
      <mesh position={[0.15, 2.0, 0.13]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial color="#1a1a3a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Speaker */}
      <mesh position={[-0.05, 2.0, 0.12]}>
        <boxGeometry args={[0.15, 0.02, 0.01]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Side Buttons */}
      <mesh position={[1.15, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.15, -0.2, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.15, 0.3, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
