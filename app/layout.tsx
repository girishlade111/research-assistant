import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  // ── Short-form meta (classic SEO) ─────────────────────────────
  title: {
    default: "ResAgent — AI Research Assistant",
    template: "%s | ResAgent",
  },
  description:
    "ResAgent is a production-grade multi-agent AI research engine. Transform raw queries into exhaustive, structured, and fact-checked intelligence reports with 7 specialized AI agents.",
  keywords: [
    "AI research assistant",
    "multi-agent AI",
    "AI research engine",
    "automated research",
    "AI report generator",
    "intelligent research",
    "LLM orchestration",
    "AI fact-checking",
    "web search AI",
    "document analysis AI",
    "NVIDIA NIM",
    "OpenRouter",
    "Next.js AI app",
    "ResAgent",
    "Lade Stack",
  ],
  authors: [{ name: "Girish Lade", url: "https://ladestack.in" }],
  creator: "Girish Lade",
  publisher: "Lade Stack",
  applicationName: "ResAgent",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  // ── Canonical & Robots ────────────────────────────────────────
  metadataBase: new URL("https://research-agent.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph (long-form social SEO) ─────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://research-agent.vercel.app",
    siteName: "ResAgent",
    title: "ResAgent — Advanced Multi-Agent Research Orchestrator",
    description:
      "Transform raw queries into exhaustive, structured, and fact-checked intelligence reports. ResAgent orchestrates 7 specialized AI agents with dynamic model routing and real-time SSE streaming.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResAgent — Multi-Agent AI Research Engine",
      },
    ],
  },

  // ── Twitter Cards ─────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@girish_lade_",
    creator: "@girish_lade_",
    title: "ResAgent — AI Research Assistant",
    description:
      "Production-grade multi-agent AI research engine. 7 specialized agents, dynamic model routing, and real-time streaming.",
    images: ["/og-image.png"],
  },

  // ── Icons & Assets ────────────────────────────────────────────
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  // ── Structured Data hint ──────────────────────────────────────
  category: "technology",
  classification: "AI / Machine Learning / Research Tools",

  // ── Verification (add your own if available) ──────────────────
  // verification: {
  //   google: "your-google-verification-code",
  //   bing: "your-bing-verification-code",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-dvh flex-col bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
