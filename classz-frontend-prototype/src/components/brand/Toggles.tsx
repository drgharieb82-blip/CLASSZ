import { Moon, Sun, Languages } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function LangSwitcher() {
  const { lang, toggleLang } = useApp();
  return (
    <Button variant="ghost" size="sm" onClick={toggleLang} className="rounded-xl gap-1.5 font-semibold">
      <Languages className="h-4 w-4" />
      {lang === "en" ? "AR" : "EN"}
    </Button>
  );
}
