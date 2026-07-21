import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-medium transition-all duration-200 ease-smooth disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-ink/90 dark:bg-white dark:text-ink dark:hover:bg-white/90",
        gold: "bg-gold text-ink hover:bg-gold-soft shadow-gold",
        outline:
          "border border-line dark:border-line-dark bg-transparent hover:bg-surface-muted dark:hover:bg-surface-mutedDark",
        ghost: "bg-transparent hover:bg-surface-muted dark:hover:bg-surface-mutedDark",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
