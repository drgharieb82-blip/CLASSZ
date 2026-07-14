import { forwardRef, isValidElement, cloneElement, type ReactElement } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "brand" | "glow" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

const variants: Record<Variant, string> = {
  brand: "gradient-brand text-white border-0 shadow-lg",
  glow: "gradient-brand text-white border-0 shadow-lg glow",
  outline: "border bg-card/60 backdrop-blur hover:bg-accent",
  ghost: "hover:bg-accent",
};

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

/**
 * Animated CTA button: subtle scale + sheen sweep on hover.
 */
export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "brand", size = "md", asChild, children, ...props }, ref) => {
    const sheen = (
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    );
    const classes = cn(
      "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      sizes[size],
      variants[variant],
      className,
    );

    if (asChild && isValidElement(children)) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {cloneElement(children as ReactElement<{ children?: React.ReactNode }>, undefined, sheen, (children as ReactElement<{ children?: React.ReactNode }>).props.children)}
        </Slot>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {sheen}
        {children}
      </button>
    );
  },
);
GradientButton.displayName = "GradientButton";
