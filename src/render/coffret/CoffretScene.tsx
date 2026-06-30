"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import CoffretMesh from "./CoffretMesh";

interface CoffretSceneProps {
  isOpen: boolean;
  onAnimationComplete?: () => void;
}

export default function CoffretScene({ isOpen, onAnimationComplete }: CoffretSceneProps) {
  return (
    <Canvas
      camera={{ fov: 33, position: [0, 3.2, 5.8], near: 0.1, far: 40 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ width: 380, height: 290, display: "block" }}
    >
      {/* Warm ambient fill */}
      <ambientLight intensity={0.3} color="#e8dfc8" />

      {/* Key light — slightly top-left, warm */}
      <directionalLight
        position={[3, 7, 4]}
        intensity={1.6}
        color="#f0e8d8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Gold fill from below — reflects the or-rose accent */}
      <pointLight position={[0, -1.5, 2]} intensity={0.55} color="#c9a36b" />

      {/* Cool rim from behind */}
      <directionalLight position={[-2, 2, -4]} intensity={0.4} color="#c8d4e0" />

      <Suspense fallback={null}>
        <CoffretMesh isOpen={isOpen} onOpenComplete={onAnimationComplete} />
      </Suspense>
    </Canvas>
  );
}
