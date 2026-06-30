"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const W = 4.0; // box width
const H = 1.4; // box height
const D = 2.2; // box depth
const LID_T = 0.1; // lid thickness
const OPEN_ANGLE = -Math.PI * 0.65;

// Gold trim helper: thin strip along the perimeter
function GoldEdge({
  args,
  position,
}: {
  args: [number, number, number];
  position: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#c9a36b" metalness={0.92} roughness={0.09} />
    </mesh>
  );
}

interface CoffretMeshProps {
  isOpen: boolean;
  onOpenComplete?: () => void;
}

export default function CoffretMesh({ isOpen, onOpenComplete }: CoffretMeshProps) {
  const lidGroupRef = useRef<THREE.Group>(null);
  const completedRef = useRef(false);

  // Lerp lid open/close every frame
  useFrame((_, delta) => {
    if (!lidGroupRef.current) return;
    const target = isOpen ? OPEN_ANGLE : 0;
    const t = 1 - Math.pow(0.004, delta); // ~120ms half-life
    lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      lidGroupRef.current.rotation.x,
      target,
      t
    );

    if (isOpen && !completedRef.current) {
      if (Math.abs(lidGroupRef.current.rotation.x - OPEN_ANGLE) < 0.025) {
        completedRef.current = true;
        onOpenComplete?.();
      }
    }
    if (!isOpen) completedRef.current = false;
  });

  // Watch-slot cushion geometry (half-cylinder arch)
  const slotGeo = useMemo(
    () => new THREE.CylinderGeometry(0.19, 0.19, LID_T + 0.02, 24, 1, false, 0, Math.PI),
    []
  );

  return (
    <group>
      {/* ── Base box ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#130d07" roughness={0.87} metalness={0.05} />
      </mesh>

      {/* Interior velvet floor */}
      <mesh position={[0, H / 2 - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.1, D - 0.1]} />
        <meshStandardMaterial color="#280606" roughness={0.98} metalness={0.0} />
      </mesh>

      {/* Watch cushion slots */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          geometry={slotGeo}
          position={[(i - 2) * 0.72, H / 2 - 0.005, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <meshStandardMaterial color="#1a0303" roughness={0.95} metalness={0.0} />
        </mesh>
      ))}

      {/* Gold trim — base top perimeter */}
      <GoldEdge args={[W + 0.02, 0.022, D + 0.02]} position={[0, H / 2, 0]} />
      {/* Gold trim — base bottom perimeter */}
      <GoldEdge args={[W + 0.02, 0.022, D + 0.02]} position={[0, -H / 2, 0]} />

      {/* ── Lid group — pivot at back-top edge ── */}
      {/*   world position: (0, H/2, -D/2) — the hinge line           */}
      <group ref={lidGroupRef} position={[0, H / 2, -D / 2]}>
        {/* Lid box: centered at (0, LID_T/2, D/2) in group-local space
            so it spans from hinge (z=0) to front edge (z=D)           */}
        <mesh position={[0, LID_T / 2, D / 2]} castShadow>
          <boxGeometry args={[W, LID_T, D]} />
          <meshStandardMaterial color="#1c1509" roughness={0.82} metalness={0.06} />
        </mesh>

        {/* Interior of lid (red velvet underside) */}
        <mesh position={[0, 0, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.1, D - 0.1]} />
          <meshStandardMaterial color="#380a0a" roughness={0.97} metalness={0.0} />
        </mesh>

        {/* Gold trim — lid top perimeter */}
        <GoldEdge args={[W + 0.02, 0.022, D + 0.02]} position={[0, LID_T, D / 2]} />
        {/* Gold trim — lid front edge */}
        <GoldEdge args={[W + 0.02, LID_T + 0.04, 0.022]} position={[0, LID_T / 2, D]} />
      </group>

      {/* Ground shadow receiver */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -H / 2 - 0.001, 0]}
      >
        <planeGeometry args={[14, 14]} />
        <shadowMaterial transparent opacity={0.38} />
      </mesh>
    </group>
  );
}
