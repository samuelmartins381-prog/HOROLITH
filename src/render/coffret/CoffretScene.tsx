"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import CoffretMesh from "./CoffretMesh";

interface CoffretSceneProps {
  isOpen: boolean;
  leakColor?: string;
  onAnimationComplete?: () => void;
}

export default function CoffretScene({
  isOpen,
  leakColor,
  onAnimationComplete,
}: CoffretSceneProps) {
  return (
    <Canvas
      camera={{ fov: 33, position: [0, 3.2, 5.8], near: 0.1, far: 40 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ width: 380, height: 290, display: "block" }}
    >
      {/* Bright ambient fill — the scene lives on porcelain */}
      <ambientLight intensity={0.55} color="#f4eee2" />

      {/* Key light — slightly top-left, warm */}
      <directionalLight
        position={[3, 7, 4]}
        intensity={1.35}
        color="#fff6e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Champagne fill from below — warms the lacquer */}
      <pointLight position={[0, -1.5, 2]} intensity={0.4} color="#c8a55a" />

      {/* Cool rim from behind — separates the box from the page */}
      <directionalLight position={[-2, 2, -4]} intensity={0.5} color="#c9d8e4" />

      <Suspense fallback={null}>
        <CoffretMesh
          isOpen={isOpen}
          leakColor={leakColor}
          onOpenComplete={onAnimationComplete}
        />
      </Suspense>
    </Canvas>
  );
}
