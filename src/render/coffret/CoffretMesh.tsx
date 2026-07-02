"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const W = 4.0; // box width
const H = 1.3; // base height
const D = 2.3; // box depth
const LID_T = 0.34; // lid thickness
const OPEN_ANGLE = -Math.PI * 0.62;

/* Materials — shared instances, tuned for the studio Environment
   set up in CoffretScene (reflections do the realism work). */

const LACQUER = {
  color: "#ece4d3",
  roughness: 0.16,
  metalness: 0.0,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  envMapIntensity: 1.0,
};

const VELVET = {
  color: "#3f0e15",
  roughness: 1.0,
  metalness: 0.0,
  sheen: 0.8,
  sheenRoughness: 0.55,
  sheenColor: "#7e3240",
  envMapIntensity: 0.3,
};

/* Gold reads through blurred env reflections (roughness) plus a hint
   of emissive — polished pure metal with a sparse env renders black. */
const GOLD = {
  color: "#d4af63",
  metalness: 1.0,
  roughness: 0.32,
  emissive: "#5c451e",
  emissiveIntensity: 0.3,
  envMapIntensity: 1.35,
};

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
      .to({}, { duration: 0.22 })
      .addLabel("open");

    // B — the seam leaks light as the lid rises
    if (light) {
      tl.to(light, { intensity: 1.6, duration: 0.55, ease: "power2.in" }, "open");
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

  return (
    <group ref={rootRef}>
      {/* ── Base — ivory lacquer, softened edges ── */}
      <RoundedBox args={[W, H, D]} radius={0.07} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial {...LACQUER} />
      </RoundedBox>

      {/* Interior velvet bed — deep garnet, sits atop the base */}
      <mesh position={[0, H / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.24, D - 0.24]} />
        <meshPhysicalMaterial {...VELVET} />
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

      {/* Watch cushions — plump velvet capsules laid lengthwise */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i - 2) * 0.75, H / 2 + 0.09, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.2, 0.85, 6, 18]} />
          <meshPhysicalMaterial {...VELVET} />
        </mesh>
      ))}

      {/* Piano hinge — polished gold bar along the back seam */}
      <mesh position={[0, H / 2 + 0.02, -D / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.038, 0.038, W - 0.55, 20]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* Catch plate — under the fermoir, on the base front */}
      <RoundedBox
        args={[0.34, 0.11, 0.05]}
        radius={0.015}
        smoothness={4}
        position={[0, H / 2 - 0.1, D / 2 + 0.015]}
      >
        <meshStandardMaterial {...GOLD} />
      </RoundedBox>

      {/* ── Lid group — pivot at back-top edge ── */}
      <group ref={lidGroupRef} position={[0, H / 2, -D / 2]}>
        {/* Lid body — slight overhang, spans hinge (z=0) to front edge */}
        <RoundedBox
          args={[W + 0.07, LID_T, D + 0.05]}
          radius={0.07}
          smoothness={6}
          position={[0, LID_T / 2, D / 2]}
          castShadow
        >
          <meshPhysicalMaterial {...LACQUER} />
        </RoundedBox>

        {/* Interior of lid — garnet velvet underside */}
        <mesh position={[0, -0.002, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.24, D - 0.24]} />
          <meshPhysicalMaterial {...VELVET} />
        </mesh>

        {/* Maison plaque — engraved gold cartouche on the lid */}
        <RoundedBox
          args={[0.95, 0.03, 0.3]}
          radius={0.012}
          smoothness={4}
          position={[0, LID_T + 0.005, D / 2]}
        >
          <meshStandardMaterial {...GOLD} roughness={0.1} />
        </RoundedBox>

        {/* Fermoir — champagne clasp on the lid front */}
        <RoundedBox
          args={[0.3, 0.17, 0.06]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.03, D + 0.02]}
        >
          <meshStandardMaterial {...GOLD} />
        </RoundedBox>
      </group>
    </group>
  );
}
