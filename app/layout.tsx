import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./project-pages.css";
import "./glui.css";
import "./field-notes.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "./providers";
import { CustomCursor } from "@/components/custom-cursor";
import { ThemeFavicon, themeFaviconScript } from "@/components/theme-favicon";
import { ProjectSignatureTransitionProvider } from "@/components/project-signature-transition";
import { CitationFocusProvider } from "@/components/citation-focus";
import { Analytics } from "@vercel/analytics/next";

// Google Fonts, self-hosted. next/font/google fails the build whenever Google
// answers with /l/font?kit= URLs (vercel/next.js#99114), so the files live in
// app/fonts, subset to Latin, Latin Extended, Greek, Arabic, math and symbols
// (scripts/self-host-google-fonts.py rebuilds them).
const inter = localFont({
  src: [
    { path: "./fonts/inter/inter-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/inter/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter/inter-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const hanken = localFont({
  src: [
    { path: "./fonts/hanken-grotesk/hanken-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/hanken-grotesk/hanken-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/hanken-grotesk/hanken-grotesk-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/hanken-grotesk/hanken-grotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-hanken",
  display: "swap",
});

const arefRuqaa = localFont({
  src: [
    { path: "./fonts/aref-ruqaa/aref-ruqaa-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/aref-ruqaa/aref-ruqaa-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-aref-ruqaa",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const amiri = localFont({
  src: [
    { path: "./fonts/amiri/amiri-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amiri/amiri-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const robotoMono = localFont({
  src: [
    { path: "./fonts/roboto-mono/roboto-mono-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/roboto-mono/roboto-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/roboto-mono/roboto-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-roboto-mono",
  display: "swap",
  adjustFontFallback: false,
});

const oswald = localFont({
  src: [
    { path: "./fonts/oswald/oswald-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/oswald/oswald-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/oswald/oswald-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/oswald/oswald-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-oswald",
  display: "swap",
});

const pinyonScript = localFont({
  src: "./fonts/pinyon-script/pinyon-script-400.woff2",
  variable: "--font-pinyon-script",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader/newsreader-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/newsreader/newsreader-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/newsreader-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/newsreader-300-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/newsreader/newsreader-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/newsreader-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const dmMono = localFont({
  src: [
    { path: "./fonts/dm-mono/dm-mono-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/dm-mono/dm-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-mono/dm-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-dm-mono",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const cormorantGaramond = localFont({
  src: [
    { path: "./fonts/cormorant-garamond/cormorant-garamond-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond/cormorant-garamond-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond/cormorant-garamond-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond/cormorant-garamond-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cormorant-garamond",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: false,
});

const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono/ibm-plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

// Mugshot identity: a soft, warm display serif (its "MUGSHOT" placard voice)
// paired with a rounded sans that stands in for the app's SF Rounded utility type.
const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces/fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fraunces/fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/fraunces/fraunces-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/fraunces/fraunces-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/fraunces/fraunces-900.woff2", weight: "900", style: "normal" },
    { path: "./fonts/fraunces/fraunces-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/fraunces/fraunces-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/fraunces/fraunces-600-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/fraunces/fraunces-700-italic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/fraunces/fraunces-900-italic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: false,
});

const nunito = localFont({
  src: [
    { path: "./fonts/nunito/nunito-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/nunito/nunito-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/nunito/nunito-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/nunito/nunito-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/nunito/nunito-800.woff2", weight: "800", style: "normal" },
    { path: "./fonts/nunito/nunito-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-nunito",
  display: "swap",
  preload: false,
});

// Querno identity: Latin Modern, the typeface of a LaTeX page (GUST Font
// License; the math font is subset to the demo's glyphs). Only its page uses
// it, so nothing preloads.
const lmDisplay = localFont({
  src: "./fonts/lmroman17-regular.otf",
  variable: "--font-lm-display",
  display: "swap",
  preload: false,
});

const lmRoman = localFont({
  src: [
    { path: "./fonts/lmroman10-regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/lmroman10-italic.otf", weight: "400", style: "italic" },
    { path: "./fonts/lmroman10-bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-lm-roman",
  display: "swap",
  preload: false,
});

const lmMath = localFont({
  src: "./fonts/latinmodern-math-subset.woff2",
  variable: "--font-lm-math",
  display: "swap",
  preload: false,
});

const fontVariables = [
  inter.variable,
  hanken.variable,
  arefRuqaa.variable,
  amiri.variable,
  robotoMono.variable,
  oswald.variable,
  pinyonScript.variable,
  newsreader.variable,
  dmMono.variable,
  cormorantGaramond.variable,
  ibmPlexMono.variable,
  fraunces.variable,
  nunito.variable,
  lmDisplay.variable,
  lmRoman.variable,
  lmMath.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL("https://youssefchouay.com"),
  title: "Youssef Chouay | يوسف شواي",
  description:
    "Portfolio of Youssef Chouay, Software Engineer and AI Researcher based in Ottawa, Canada.",
  keywords: [
    "Youssef Chouay",
    "Software Engineer",
    "AI Researcher",
    "Graph Theory",
    "Full Stack Developer",
    "Machine Learning",
  ],
  authors: [{ name: "Youssef Chouay" }],
  creator: "Youssef Chouay",
  publisher: "Youssef Chouay",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Youssef Chouay | يوسف شواي",
    description: "Software Engineer and AI Researcher",
    type: "website",
    url: "/",
    siteName: "Youssef Chouay",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Youssef Chouay | يوسف شواي",
    description: "Software Engineer and AI Researcher",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeFaviconScript }} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ThemeFavicon />
            <CustomCursor />
            {children}
            <ProjectSignatureTransitionProvider />
            <CitationFocusProvider />
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
