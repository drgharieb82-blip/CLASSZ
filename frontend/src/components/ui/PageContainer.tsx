import { type ReactNode } from "react";
import { clsx } from "clsx";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={clsx("mx-auto w-full max-w-[1440px] space-y-6", className)}>{children}</div>;
}
