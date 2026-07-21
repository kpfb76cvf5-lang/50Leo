"use client";

import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import type { Bar } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BarCardProps {
  bar: Bar;
  onClick?: () => void;
  className?: string;
}

export function BarCard({ bar, onClick, className }: BarCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl2 bg-surface dark:bg-surface-dark shadow-card hover:shadow-cardHover transition-shadow duration-300 ease-smooth text-left",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted dark:bg-surface-mutedDark">
        {bar.cover_photo_url && (
          <Image
            src={bar.cover_photo_url}
            alt={bar.name}
            fill
            sizes="(max-width: 768px) 90vw, 320px"
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
          />
        )}
        {bar.is_50best && (
          <Badge variant="gold" className="absolute left-3 top-3 backdrop-blur-md bg-gold/90">
            50 Best
          </Badge>
        )}
        <span className="absolute right-3 top-3 rounded-pill bg-ink/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
          {bar.price_range}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{bar.name}</h3>
          {bar.rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {bar.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <MapPin className="h-3 w-3" />
          {bar.neighborhood?.name}
          {bar.distance_m != null && ` · ${formatDistance(bar.distance_m)}`}
        </p>

        {bar.signature_cocktail && (
          <p className="mt-1 line-clamp-1 text-xs text-text-secondary">
            Signature: <span className="text-text-primary dark:text-text-onDark">{bar.signature_cocktail}</span>
          </p>
        )}

        {bar.tags && bar.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bar.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="neutral">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
