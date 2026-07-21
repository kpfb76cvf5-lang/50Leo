"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Martini } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const signInWithProvider = (provider: "google" | "apple") =>
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <Martini className="mb-4 h-10 w-10 text-gold" strokeWidth={1.5} />
      <h1 className="mb-1 text-display-sm">Accedi</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Salva i tuoi locali preferiti e crea itinerari personalizzati.
      </p>

      <div className="w-full space-y-3">
        <Button variant="outline" className="w-full" onClick={() => signInWithProvider("google")}>
          Continua con Google
        </Button>
        <Button variant="outline" className="w-full" onClick={() => signInWithProvider("apple")}>
          Continua con Apple
        </Button>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-line dark:bg-line-dark" />
          <span className="text-xs text-text-secondary">oppure</span>
          <div className="h-px flex-1 bg-line dark:bg-line-dark" />
        </div>

        {sent ? (
          <p className="text-sm text-gold-dim">
            Ti abbiamo inviato un link di accesso a <strong>{email}</strong>.
          </p>
        ) : (
          <form onSubmit={signInWithEmail} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              className="input"
            />
            <Button type="submit" variant="gold" className="w-full">
              Continua con Email
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
