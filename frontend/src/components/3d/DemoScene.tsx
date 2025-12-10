'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import PhoneModel from './PhoneModel';

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

export default function DemoScene() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full h-full"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff6b00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7c3aed" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#f97316"
          castShadow
        />

        {/* Environment */}
        <Environment preset="city" />
        
        {/* Stars Background */}
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Phone Model with Float Animation */}
        <Suspense fallback={null}>
          <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.5}
          >
            <PhoneModel scale={1.2} />
          </Float>
        </Suspense>

        {/* Fog for depth */}
        <fog attach="fog" args={['#0D0D0F', 8, 30]} />
      </Canvas>

      {/* Overlay Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </motion.div>
  );
}
