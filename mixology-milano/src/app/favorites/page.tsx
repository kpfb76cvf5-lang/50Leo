"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { BarCard } from "@/components/bars/BarCard";
import { EventCard } from "@/components/events/EventCard";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites-detail"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { bars: [], events: [] };

      const [{ data: favBars }, { data: favEvents }] = await Promise.all([
        supabase
          .from("favorites")
          .select("bar:bars(*, neighborhood:neighborhoods(*), tags:bar_tags(tag:tags(*)))")
          .eq("user_id", auth.user.id)
          .not("bar_id", "is", null),
        supabase
          .from("favorites")
          .select("event:events(*, bar:bars(name, address))")
          .eq("user_id", auth.user.id)
          .not("event_id", "is", null),
      ]);

      return {
        bars: (favBars ?? []).map((f: any) => ({
          ...f.bar,
          tags: f.bar.tags?.map((t: any) => t.tag) ?? [],
        })),
        events: (favEvents ?? []).map((f: any) => f.event),
      };
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <h1 className="mb-4 text-display-sm">I tuoi preferiti</h1>

      {isLoading && <p className="text-sm text-text-secondary">Caricamento…</p>}

      {!isLoading && data?.bars.length === 0 && data?.events.length === 0 && (
        <div className="rounded-xl2 border border-dashed border-line dark:border-line-dark p-8 text-center">
          <p className="text-sm text-text-secondary">
            Non hai ancora salvato locali o eventi. Accedi ed esplora la mappa per iniziare.
          </p>
        </div>
      )}

      {data?.bars && data.bars.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-text-secondary">Locali salvati</h2>
          <div className="grid grid-cols-2 gap-3">
            {data.bars.map((bar: any) => (
              <BarCard key={bar.id} bar={bar} onClick={() => router.push(`/bars/${bar.slug}`)} />
            ))}
          </div>
        </section>
      )}

      {data?.events && data.events.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-text-secondary">Eventi salvati</h2>
          <div className="space-y-3">
            {data.events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
