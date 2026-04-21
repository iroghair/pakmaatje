"use client";

import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

const localeOptions: Array<{ locale: Locale; flag: string; shortLabel: string }> = [
  { locale: "nl", flag: "🇳🇱", shortLabel: "NL" },
  { locale: "en_us", flag: "🇺🇸", shortLabel: "EN" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale, messages } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/60 bg-white/65 p-1 shadow-lg backdrop-blur-xl">
      {localeOptions.map((option) => {
        const isActive = option.locale === locale;

        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => {
              if (option.locale === locale) {
                return;
              }

              setLocale(option.locale);
              router.refresh();
            }}
            aria-pressed={isActive}
            aria-label={messages.languageSwitcher[option.locale]}
            title={messages.languageSwitcher[option.locale]}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all ${
              isActive
                ? "bg-primary-500 text-white shadow-md"
                : "bg-transparent text-primary-950 hover:bg-white/80"
            }`}
          >
            <span aria-hidden="true">{option.flag}</span>
            <span className="sr-only">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}