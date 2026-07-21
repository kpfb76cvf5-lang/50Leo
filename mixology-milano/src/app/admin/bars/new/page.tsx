"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

const barSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio"),
  address: z.string().min(5, "Indirizzo obbligatorio"),
  lat: z.coerce.number().min(45).max(46, "Latitudine fuori dai confini di Milano"),
  lng: z.coerce.number().min(9).max(10, "Longitudine fuori dai confini di Milano"),
  description: z.string().optional(),
  signature_cocktail: z.string().optional(),
  price_range: z.enum(["€", "€€", "€€€", "€€€€"]),
  website_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  coverPhoto: z.custom<FileList>().optional(),
});

type BarFormValues = z.infer<typeof barSchema>;

export default function NewBarPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BarFormValues>({
    resolver: zodResolver(barSchema),
    defaultValues: { price_range: "€€" },
  });

  const onSubmit = async (values: BarFormValues) => {
    const supabase = createClient();
    let cover_photo_url: string | null = null;

    const file = values.coverPhoto?.[0];
    if (file) {
      const path = `bars/${Date.now()}-${slugify(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("public-media").upload(path, file);
      if (!uploadError) {
        cover_photo_url = supabase.storage.from("public-media").getPublicUrl(path).data.publicUrl;
      }
    }

    const { error } = await supabase.from("bars").insert({
      slug: slugify(values.name),
      name: values.name,
      address: values.address,
      lat: values.lat,
      lng: values.lng,
      description: values.description,
      signature_cocktail: values.signature_cocktail,
      price_range: values.price_range,
      website_url: values.website_url || null,
      instagram_url: values.instagram_url || null,
      phone: values.phone || null,
      cover_photo_url,
      status: "draft",
    });

    if (!error) router.push("/admin");
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-display-sm">Nuovo locale</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nome" error={errors.name?.message}>
          <input {...register("name")} className="input" />
        </Field>

        <Field label="Indirizzo" error={errors.address?.message}>
          <input {...register("address")} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitudine" error={errors.lat?.message}>
            <input {...register("lat")} type="number" step="any" className="input" />
          </Field>
          <Field label="Longitudine" error={errors.lng?.message}>
            <input {...register("lng")} type="number" step="any" className="input" />
          </Field>
        </div>

        <Field label="Descrizione">
          <textarea {...register("description")} rows={4} className="input" />
        </Field>

        <Field label="Signature Cocktail">
          <input {...register("signature_cocktail")} className="input" />
        </Field>

        <Field label="Fascia di prezzo">
          <select {...register("price_range")} className="input">
            <option>€</option>
            <option>€€</option>
            <option>€€€</option>
            <option>€€€€</option>
          </select>
        </Field>

        <Field label="Sito web" error={errors.website_url?.message}>
          <input {...register("website_url")} className="input" />
        </Field>

        <Field label="Instagram" error={errors.instagram_url?.message}>
          <input {...register("instagram_url")} className="input" />
        </Field>

        <Field label="Telefono">
          <input {...register("phone")} className="input" />
        </Field>

        <Field label="Foto di copertina">
          <input {...register("coverPhoto")} type="file" accept="image/*" className="input" />
        </Field>

        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio…" : "Crea locale (bozza)"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
