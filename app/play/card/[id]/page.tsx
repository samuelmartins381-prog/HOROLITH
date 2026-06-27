import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SEED_CARDS, getCard } from "@/src/game/canon/seed-cards";
import CardDetailView from "@/src/ui/CardDetailView";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  return SEED_CARDS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getCard(id);
  if (!card) return { title: "Horolith" };
  return { title: `${card.name} — Horolith` };
}

export default async function CardPage({ params }: { params: Params }) {
  const { id } = await params;
  const card = getCard(id);
  if (!card) notFound();

  return <CardDetailView card={card} />;
}
