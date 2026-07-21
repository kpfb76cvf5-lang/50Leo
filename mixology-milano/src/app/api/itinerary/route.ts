import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildOptimizedItinerary } from "@/lib/itinerary";
import { z } from "zod";

const bodySchema = z.object({
  barIds: z.array(z.string().uuid()).min(2).max(10),
  startLat: z.number(),
  startLng: z.number(),
  travelMode: z.enum(["walking", "transit", "taxi"]).default("walking"),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { barIds, startLat, startLng, travelMode } = parsed.data;

  const supabase = await createClient();
  const { data: bars, error } = await supabase
    .from("bars")
    .select("*")
    .in("id", barIds)
    .eq("status", "published");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bars || bars.length === 0) {
    return NextResponse.json({ error: "Nessun locale trovato" }, { status: 404 });
  }

  const result = buildOptimizedItinerary(bars as any, startLat, startLng, travelMode);

  return NextResponse.json(result);
}
