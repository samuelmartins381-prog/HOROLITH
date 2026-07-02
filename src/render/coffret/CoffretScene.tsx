"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import CoffretMesh from "./CoffretMesh";

interface CoffretSceneProps {
  isOpen: boolean;
  leakColor?: string;
  onAnimationComplete?: () => void;
}

/* Studio lighting built procedurally (no network fetch): a warm
   overhead softbox, cool + warm side fills, and a front reflector.
   The Environment is what makes the lacquer and gold read as real —
   PBR reflections instead of flat shading. */

export default function CoffretScene({
  isOpen,
  leakColor,
  onAnimationComplete,
}: CoffretSceneProps) {
  return (
    <Canvas
      camera={{ fov: 30, position: [0, 2.75, 6.4], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: 420, height: 315, display: "block" }}
    >
      {/* Soft base fill — keeps shadowed faces from going muddy */}
      <ambientLight intensity={0.32} color="#f4eee2" />

      {/* Key light for direct shading */}
      <directionalLight position={[3.5, 6, 4]} intensity={0.9} color="#fff4e0" />

      <Environment resolution={256} frames={1}>
        {/* Overhead softbox */}
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 6, 0]}
          rotation-x={-Math.PI / 2}
          scale={[9, 9, 1]}
          color="#fff8ec"
        />
        {/* Cool fill, camera-left */}
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-6, 2, 2]}
          rotation-y={Math.PI / 2}
          scale={[6, 3, 1]}
          color="#dce8f2"
        />
        {/* Warm kicker, camera-right */}
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[6, 3, -2]}
          rotation-y={-Math.PI / 2}
          scale={[7, 4, 1]}
          color="#ffe9c4"
        />
        {/* Front reflector — the long glint on the lacquer */}
        <Lightformer
          form="circle"
          intensity={1.8}
          position={[0, 2.5, 7]}
          scale={[3.5, 3.5, 1]}
          color="#ffffff"
        />
      </Environment>

      {/* Grounding — soft contact shadow under the box */}
      <ContactShadows
        position={[0, -0.66, 0]}
        opacity={0.42}
        scale={11}
        blur={2.4}
        far={2.8}
        resolution={512}
        color="#2b2117"
        frames={Infinity}
      />

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
