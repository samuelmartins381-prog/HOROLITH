import type { Metadata } from "next";
import CollectionBinder from "@/src/ui/CollectionBinder";

export const metadata: Metadata = {
  title: "Collection — Horolith",
};

export default function CollectionPage() {
  return <CollectionBinder />;
}
