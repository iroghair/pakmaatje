"use client";

import { SessionProvider } from "next-auth/react";
import { type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleProvider } from "./LocaleProvider";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <SessionProvider>
      <LocaleProvider initialLocale={initialLocale}>
        <div className="fixed right-4 top-4 z-50">
          <LanguageSwitcher />
        </div>
        {children}
      </LocaleProvider>
    </SessionProvider>
  );
}
