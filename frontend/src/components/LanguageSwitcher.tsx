import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language === "ar" ? "ar" : "en";

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-ink-950/10 bg-white/76 px-3 py-2 text-sm font-semibold text-ink-950 dark:border-white/10 dark:bg-white/8 dark:text-chalk">
      <Languages className="h-4 w-4 text-ink-600 dark:text-ink-300" aria-hidden="true" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={currentLanguage}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        className="bg-transparent text-sm font-semibold outline-none"
        aria-label={t("language.label")}
      >
        <option value="en">{t("language.english")}</option>
        <option value="ar">{t("language.arabic")}</option>
      </select>
    </label>
  );
}
