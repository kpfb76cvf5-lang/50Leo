"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventCalendarTab } from "@/types/database";
import { startOfDay, endOfDay, addDays, endOfWeek } from "date-fns";

const EVENT_SELECT = `
  *,
  bar:bars(id, name, slug, cover_photo_url, address, neighborhood:neighborhoods(name)),
  bartenders:event_bartenders(bartender:bartenders(*))
`;

function rangeForTab(tab: EventCalendarTab) {
  const now = new Date();
  switch (tab) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "tomorrow": {
      const t = addDays(now, 1);
      return { from: startOfDay(t), to: endOfDay(t) };
    }
    case "week":
      return { from: startOfDay(now), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "all":
    default:
      return { from: startOfDay(now), to: addDays(now, 365) };
  }
}

export function useEvents(tab: EventCalendarTab = "all") {
  return useQuery({
    queryKey: ["events", tab],
    queryFn: async () => {
      const supabase = createClient();
      const { from, to } = rangeForTab(tab);
      const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .gte("starts_at", from.toISOString())
        .lte("starts_at", to.toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((e: any) => ({
        ...e,
        bartenders: e.bartenders?.map((b: any) => b.bartender) ?? [],
      })) as Event[];
    },
    staleTime: 60_000,
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return {
        ...data,
        bartenders: (data as any).bartenders?.map((b: any) => b.bartender) ?? [],
      } as Event;
    },
    enabled: !!slug,
  });
}
