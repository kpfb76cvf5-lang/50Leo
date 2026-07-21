import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, MapPin, Wine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBar(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bars")
    .select(`*, neighborhood:neighborhoods(*), tags:bar_tags(tag:tags(*)), events(*)`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (!data) return null;
  return { ...data, tags: (data as any).tags?.map((t: any) => t.tag) ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bar = await getBar(slug);
  if (!bar) return {};

  const title = `${bar.name} — Cocktail Bar a ${bar.neighborhood?.name ?? "Milano"}`;
  const description =
    bar.description?.slice(0, 155) ??
    `Scopri ${bar.name}, cocktail bar a Milano. Orari, drink list, eventi e prenotazioni su ${SITE_CONFIG.name}.`;

  return {
    title,
    description,
    openGraph: { title, description, images: bar.cover_photo_url ? [bar.cover_photo_url] : [] },
    alternates: { canonical: `${SITE_CONFIG.url}/bars/${bar.slug}` },
  };
}

export default async function BarPage({ params }: Props) {
  const { slug } = await params;
  const bar = await getBar(slug);
  if (!bar) notFound();

  // JSON-LD per rich results (Bar / LocalBusiness)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: bar.name,
    address: bar.address,
    image: bar.cover_photo_url,
    telephone: bar.phone,
    url: bar.website_url,
    priceRange: bar.price_range,
    aggregateRating: bar.rating
      ? { "@type": "AggregateRating", ratingValue: bar.rating, reviewCount: bar.rating_count }
      : undefined,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {bar.cover_photo_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl2">
          <Image src={bar.cover_photo_url} alt={bar.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mt-6 text-display-md">{bar.name}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-text-secondary">
        <MapPin className="h-4 w-4" /> {bar.address} · {bar.neighborhood?.name}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {bar.rating && (
          <span className="flex items-center gap-1 font-medium">
            <Star className="h-4 w-4 fill-gold text-gold" /> {bar.rating.toFixed(1)}
          </span>
        )}
        <span>{bar.price_range}</span>
        {(bar.tags ?? []).map((tag: any) => (
          <Badge key={tag.id} variant="outline">{tag.name}</Badge>
        ))}
      </div>

      {bar.description && <p className="mt-6 leading-relaxed">{bar.description}</p>}

      {bar.signature_cocktail && (
        <div className="mt-6 rounded-xl2 bg-surface-muted dark:bg-surface-mutedDark p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-dim">
            <Wine className="h-4 w-4" /> Signature Cocktail
          </p>
          <p className="mt-1 text-lg font-medium">{bar.signature_cocktail}</p>
          <p className="mt-1 text-sm text-text-secondary">{bar.signature_cocktail_desc}</p>
        </div>
      )}
    </article>
  );
}
