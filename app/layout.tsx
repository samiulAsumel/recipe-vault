import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono, Noto_Sans_Bengali } from "next/font/google";
import { ContentProtection } from "@/components/layout/ContentProtection";
import { VisitBeacon } from "@/components/layout/VisitBeacon";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

// None of the three Latin fonts above offer a Bengali subset upstream — this
// is the site's only Bengali-capable font, covering all three type roles
// (display/body/meta) via [lang="bn"] in globals.css, since Bengali
// typography doesn't carry the same serif/mono role distinctions Latin does.
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: "variable",
  variable: "--font-noto-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "World Kitchen Atlas",
    template: "%s | World Kitchen Atlas",
  },
  description:
    "A global culinary encyclopedia organized by continent, country, and dish — with history, occasion, and traditional drink pairings for every entry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} ${notoSansBengali.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-parchment text-ink">
        <ContentProtection />
        <VisitBeacon />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
