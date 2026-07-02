"use client";

import { useRef, useMemo, useEffect } from "react";
import { gsap } from "gsap";
import * as THREE from "three";

const W = 4.0; // box width
const H = 1.4; // box height
const D = 2.2; // box depth
const LID_T = 0.1; // lid thickness
const OPEN_ANGLE = -Math.PI * 0.65;

// Champagne trim helper: thin strip along the perimeter.
// Moderate metalness + warm emissive so the gold reads without an
// environment map (full metal renders black with no reflections).
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
      <meshStandardMaterial
        color="#c8a55a"
        metalness={0.55}
        roughness={0.25}
        emissive="#8a6a2c"
        emissiveIntensity={0.28}
      />
    </mesh>
  );
}

interface CoffretMeshProps {
  isOpen: boolean;
  /** Rarity tell — colour of the light escaping the coffret */
  leakColor?: string;
  onOpenComplete?: () => void;
}

export default function CoffretMesh({
  isOpen,
  leakColor = "#ffd98f",
  onOpenComplete,
}: CoffretMeshProps) {
  const rootRef = useRef<THREE.Group>(null);
  const lidGroupRef = useRef<THREE.Group>(null);
  const tellLightRef = useRef<THREE.PointLight>(null);
  const completeCbRef = useRef(onOpenComplete);

  useEffect(() => {
    completeCbRef.current = onOpenComplete;
  }, [onOpenComplete]);

  /* Opening choreography — anticipation, a beat of silence, the lid
     rises past its mark, then settles. The tell light warms up as
     the seam opens (§7-C: fuite de lumière colorée selon rareté). */
  useEffect(() => {
    const root = rootRef.current;
    const lid = lidGroupRef.current;
    const light = tellLightRef.current;
    if (!root || !lid) return;

    if (!isOpen) {
      lid.rotation.x = 0;
      root.scale.set(1, 1, 1);
      if (light) light.intensity = 0;
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => completeCbRef.current?.(),
    });

    // A — anticipation: the coffret presses down under the hand
    tl.to(root.scale, { y: 0.965, duration: 0.17, ease: "power2.in" })
      .to(root.scale, { y: 1, duration: 0.24, ease: "power2.out" })
      // beat of silence before the reveal (§16.8)
      .to({}, { duration: 0.22 });

    // B — the seam leaks light as the lid rises
    if (light) {
      tl.to(light, { intensity: 1.5, duration: 0.55, ease: "power2.in" }, "open");
    }

    // C — lid opens slightly past its mark…
    tl.to(
      lid.rotation,
      { x: OPEN_ANGLE * 1.045, duration: 0.62, ease: "power3.inOut" },
      "open"
    )
      // …and settles with mechanical weight
      .to(lid.rotation, { x: OPEN_ANGLE, duration: 0.28, ease: "power2.out" });

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // Watch-slot cushion geometry (half-cylinder arch)
  const slotGeo = useMemo(
    () => new THREE.CylinderGeometry(0.19, 0.19, LID_T + 0.02, 24, 1, false, 0, Math.PI),
    []
  );

  return (
    <group ref={rootRef}>
      {/* ── Base box — ivory lacquer (clearcoat = laque profonde) ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshPhysicalMaterial
          color="#ece5d6"
          roughness={0.32}
          metalness={0.02}
          clearcoat={0.55}
          clearcoatRoughness={0.22}
        />
      </mesh>

      {/* Interior velvet floor — deep garnet, sits atop the base
          so it reads as the lined interior once the lid opens */}
      <mesh position={[0, H / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.1, D - 0.1]} />
        <meshStandardMaterial color="#3a0d12" roughness={0.98} metalness={0.0} />
      </mesh>

      {/* Rarity tell light — hidden inside the box, ramps up on open */}
      <pointLight
        ref={tellLightRef}
        position={[0, H / 2 + 0.55, 0.3]}
        intensity={0}
        distance={4.5}
        decay={2}
        color={leakColor}
      />

      {/* Watch cushion slots */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          geometry={slotGeo}
          position={[(i - 2) * 0.72, H / 2 + 0.006, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <meshStandardMaterial color="#2c080c" roughness={0.95} metalness={0.0} />
        </mesh>
      ))}

      {/* Gold trim — base top perimeter (frame, not slab: the
          interior must stay visible once the lid opens) */}
      <GoldEdge args={[W + 0.02, 0.022, 0.06]} position={[0, H / 2, D / 2]} />
      <GoldEdge args={[W + 0.02, 0.022, 0.06]} position={[0, H / 2, -D / 2]} />
      <GoldEdge args={[0.06, 0.022, D + 0.02]} position={[W / 2, H / 2, 0]} />
      <GoldEdge args={[0.06, 0.022, D + 0.02]} position={[-W / 2, H / 2, 0]} />
      {/* Gold trim — base bottom hairline */}
      <GoldEdge args={[W + 0.02, 0.022, D + 0.02]} position={[0, -H / 2, 0]} />

      {/* ── Lid group — pivot at back-top edge ── */}
      {/*   world position: (0, H/2, -D/2) — the hinge line           */}
      <group ref={lidGroupRef} position={[0, H / 2, -D / 2]}>
        {/* Lid box: centered at (0, LID_T/2, D/2) in group-local space
            so it spans from hinge (z=0) to front edge (z=D)           */}
        <mesh position={[0, LID_T / 2, D / 2]} castShadow>
          <boxGeometry args={[W, LID_T, D]} />
          <meshPhysicalMaterial
            color="#efe8d9"
            roughness={0.3}
            metalness={0.02}
            clearcoat={0.55}
            clearcoatRoughness={0.22}
          />
        </mesh>

        {/* Interior of lid (garnet velvet underside) */}
        <mesh position={[0, 0, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.1, D - 0.1]} />
          <meshStandardMaterial color="#45101a" roughness={0.97} metalness={0.0} />
        </mesh>

        {/* Gold trim — lid front edge hairline */}
        <GoldEdge args={[W + 0.02, 0.03, 0.024]} position={[0, LID_T, D]} />

        {/* Fermoir — champagne clasp at the front centre */}
        <GoldEdge
          args={[0.32, LID_T + 0.1, 0.05]}
          position={[0, LID_T / 2 - 0.02, D + 0.02]}
        />
      </group>

      {/* Ground shadow receiver — soft, light-theme weight */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -H / 2 - 0.001, 0]}
      >
        <planeGeometry args={[14, 14]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
