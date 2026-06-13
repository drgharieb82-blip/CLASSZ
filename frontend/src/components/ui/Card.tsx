import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { clsx } from "clsx";

type CardProps<T extends ElementType> = {
  as?: T;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Card<T extends ElementType = "section">({
  as,
  interactive = false,
  children,
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={clsx(
        "rounded-xl border border-slate-200/80 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur transition duration-200 dark:border-white/10 dark:bg-slate-900/72 dark:shadow-[0_14px_38px_rgba(0,0,0,0.28)]",
        interactive && "hover:-translate-y-0.5 hover:border-teal-500/35 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] dark:hover:border-teal-300/35",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
