import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2 font-bold", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-lg">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span className="text-xl tracking-tight">
        CLASS<span className="text-gradient">Z</span>
      </span>
    </Link>
  );
}
