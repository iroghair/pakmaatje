import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import {
  getDictionary,
  getHtmlLang,
  LOCALE_COOKIE_NAME,
  resolveLocale,
} from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

const metadataDictionary = getDictionary(resolveLocale(undefined));

export const metadata: Metadata = {
  title: metadataDictionary.metadata.title,
  description: metadataDictionary.metadata.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  return (
    <html lang={getHtmlLang(locale)}>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
