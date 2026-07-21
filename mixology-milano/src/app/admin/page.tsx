import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Server component: verifica ruolo staff via RLS/profiles prima di mostrare la dashboard.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    redirect("/");
  }

  const { data: bars } = await supabase
    .from("bars")
    .select("id, name, status, price_range, rating, neighborhood:neighborhoods(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-display-sm">Dashboard Admin</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Esporta CSV
          </Button>
          <Link href="/admin/bars/new">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4" /> Nuovo locale
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-line dark:border-line-dark">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted dark:bg-surface-mutedDark text-left text-text-secondary">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Quartiere</th>
              <th className="p-3">Prezzo</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Stato</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(bars ?? []).map((bar: any) => (
              <tr key={bar.id} className="border-t border-line dark:border-line-dark">
                <td className="p-3 font-medium">{bar.name}</td>
                <td className="p-3">{bar.neighborhood?.name}</td>
                <td className="p-3">{bar.price_range}</td>
                <td className="p-3">{bar.rating ?? "—"}</td>
                <td className="p-3">
                  <Badge variant={bar.status === "published" ? "gold" : "neutral"}>
                    {bar.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/bars/${bar.id}`} className="text-gold-dim hover:underline">
                    Modifica
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-text-secondary">
        Nota: la form di creazione/modifica locale (`/admin/bars/[id]`) segue lo stesso pattern
        di questa pagina — server component per il fetch, client component con React Hook Form +
        Zod per la validazione, upload immagini su Supabase Storage. Vedi{" "}
        <code>src/app/admin/bars/new/page.tsx</code> come punto di estensione.
      </p>
    </div>
  );
}
