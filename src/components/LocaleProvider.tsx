"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getDictionary,
  getHtmlLang,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: ReturnType<typeof getDictionary>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(locale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, messages: getDictionary(locale) }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  return context;
}

export function useTranslations() {
  return useLocale().messages;
}