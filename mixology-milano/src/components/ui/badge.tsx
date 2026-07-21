import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-muted text-text-secondary dark:bg-surface-mutedDark dark:text-text-onDarkSecondary",
        gold: "bg-gold/10 text-gold-dim dark:text-gold-soft",
        dark: "bg-ink text-white dark:bg-white dark:text-ink",
        outline: "border border-line dark:border-line-dark",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
