import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Glassmorphism card with optional gradient border + glow, and a gentle
 * lift-on-hover micro-interaction.
 */
export function GlowCard({
  children,
  className,
  gradientBorder = false,
  glow = false,
  ...props
}: { children: ReactNode; className?: string; gradientBorder?: boolean; glow?: boolean } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative rounded-2xl",
        gradientBorder && "p-[1px] gradient-brand",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-2xl border bg-card/70 backdrop-blur-xl",
          gradientBorder && "border-transparent",
          glow && "glow",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
