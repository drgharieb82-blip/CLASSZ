import { Construction } from "lucide-react";

type ModulePlaceholderPageProps = {
  name: string;
};

export function ModulePlaceholderPage({ name }: ModulePlaceholderPageProps) {
  return (
    <section className="rounded-md border border-dashed border-ink-950/20 bg-white/70 p-8 dark:border-white/20 dark:bg-white/7">
      <Construction className="h-6 w-6 text-campus-500" aria-hidden="true" />
      <h2 className="mt-4 font-display text-3xl">{name}</h2>
      <p className="mt-2 max-w-xl text-ink-600 dark:text-ink-200">
        This route is intentionally reserved as a module boundary. Business workflows will be
        implemented here after the platform foundation is stable.
      </p>
    </section>
  );
}
