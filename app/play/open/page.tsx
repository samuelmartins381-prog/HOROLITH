import type { Metadata } from "next";
import PackOpeningScene from "@/src/ui/pack-opening/PackOpeningScene";
import AuthGate from "@/src/ui/auth/AuthGate";

export const metadata: Metadata = {
  title: "Ouvrir un Coffret — Horolith",
};

export default function OpenPackPage() {
  return (
    <>
      <PackOpeningScene />
      <AuthGate />
    </>
  );
}
