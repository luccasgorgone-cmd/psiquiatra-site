import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/cormorant";
import "@fontsource-variable/lora";
import "@fontsource-variable/manrope";
import "@fontsource-variable/work-sans";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { getSettings, mediaUrl } from "@/lib/queries";
import { headingStack, bodyStack } from "@/lib/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s?.metaTitle || s?.siteName || "Psiquiatra";
  const description =
    s?.metaDescription ||
    "Atendimento psiquiátrico humanizado, presencial e online. Agende sua consulta.";
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const og = mediaUrl(s?.ogImageId) || mediaUrl(s?.heroImageId) || undefined;
  const favicon = mediaUrl(s?.faviconId) || "/favicon.svg";
  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s · ${s?.siteName || title}` },
    description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "pt_BR",
      images: og ? [{ url: og }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  const brandStyle = {
    "--brand": s?.brandRgb || "70 90 82",
    "--brand-soft": s?.brandSoftRgb || "120 140 130",
    "--brand-deep": s?.brandDeepRgb || "40 54 48",
    "--font-serif": headingStack(s?.fontHeading),
    "--font-sans": bodyStack(s?.fontBody),
  } as React.CSSProperties;

  return (
    <html lang="pt-BR" style={brandStyle}>
      <body>{children}</body>
    </html>
  );
}
