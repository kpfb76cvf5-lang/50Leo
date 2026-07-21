"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useFavorites() {
  const supabase = createClient();
  const qc = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { barIds: new Set<string>(), eventIds: new Set<string>() };
      const { data, error } = await supabase
        .from("favorites")
        .select("bar_id, event_id")
        .eq("user_id", auth.user.id);
      if (error) throw error;
      return {
        barIds: new Set(data.filter((f) => f.bar_id).map((f) => f.bar_id!)),
        eventIds: new Set(data.filter((f) => f.event_id).map((f) => f.event_id!)),
      };
    },
  });

  const toggleBar = useMutation({
    mutationFn: async ({ barId, isFavorite }: { barId: string; isFavorite: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("AUTH_REQUIRED");
      if (isFavorite) {
        await supabase.from("favorites").delete().eq("bar_id", barId).eq("user_id", auth.user.id);
      } else {
        await supabase.from("favorites").insert({ bar_id: barId, user_id: auth.user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const toggleEvent = useMutation({
    mutationFn: async ({ eventId, isFavorite }: { eventId: string; isFavorite: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("AUTH_REQUIRED");
      if (isFavorite) {
        await supabase.from("favorites").delete().eq("event_id", eventId).eq("user_id", auth.user.id);
      } else {
        await supabase.from("favorites").insert({ event_id: eventId, user_id: auth.user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return { favoritesQuery, toggleBar, toggleEvent };
}
