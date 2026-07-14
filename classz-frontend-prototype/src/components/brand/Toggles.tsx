import { Gamepad2, Moon, Sun, Languages, Volume2, VolumeX } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  const icon = theme === "light" ? <Sun className="h-5 w-5" /> : theme === "dark" ? <Moon className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5" />;
  const label = theme === "light" ? "Switch to dark mode" : theme === "dark" ? "Switch to game mode" : "Switch to light mode";
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} title={label} className="rounded-xl">
      {icon}
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

export function SoundToggle() {
  const { uiSoundsEnabled, toggleUiSounds } = useApp();
  const label = uiSoundsEnabled ? "Disable UI sounds" : "Enable UI sounds";
  return (
    <Button variant="ghost" size="icon" onClick={toggleUiSounds} aria-label={label} title={label} className="rounded-xl">
      {uiSoundsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
}
