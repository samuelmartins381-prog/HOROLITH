import type { Metadata } from "next";
import PackOpeningScene from "@/src/ui/pack-opening/PackOpeningScene";

export const metadata: Metadata = {
  title: "Ouvrir un Coffret — Horolith",
};

export default function OpenPackPage() {
  return <PackOpeningScene />;
}
