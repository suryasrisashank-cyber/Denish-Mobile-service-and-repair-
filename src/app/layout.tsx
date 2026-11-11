import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BUSINESS_CONFIG } from "@/data/repairData";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeProvider as GitHubThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "DENISH MOBILE REPAIRING AND SERVICE | Your Mobile, Our Care",
  description:
    "Professional mobile repairing and service in Gandhinagar, Gujarat. Screen replacement, battery renewal, charging port repair, software solutions, IC/PCB micro-soldering, water damage recovery. Tap Call Now for assistance.",
  keywords: [
    "DENISH MOBILE REPAIRING",
    "mobile repair Gandhinagar",
    "mobile repair shop Gujarat",
    "screen replacement",
    "battery replacement",
    "phone water damage repair",
    "IC PCB repair",
    "charging problem repair",
    "mobile service center Gandhinagar",
    "iPhone repair Gandhinagar",
    "Samsung repair Gandhinagar",
    "OnePlus repair Gandhinagar",
    "phone repair Gandhinagar",
  ],
  authors: [{ name: "DENISH MOBILE REPAIRING AND SERVICE" }],
  creator: "DENISH MOBILE REPAIRING AND SERVICE",
  metadataBase: new URL("https://denish-mobile-repair.vercel.app"),
  openGraph: {
    title: "DENISH MOBILE REPAIRING AND SERVICE | Your Mobile, Our Care",
    description:
      "Your Phone. Our Priority. Reliable mobile repair solutions for your everyday needs in Gandhinagar, Gujarat. Contact our shop for assistance.",
    url: "https://denish-mobile-repair.vercel.app",
    siteName: "DENISH MOBILE REPAIRING AND SERVICE",
    images: [
      {
        url: "/hero-video-poster.png",
        width: 1200,
        height: 630,
        alt: "DENISH MOBILE REPAIRING AND SERVICE flagship workshop visual",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DENISH MOBILE REPAIRING AND SERVICE",
    description: "Your Mobile, Our Care. Call Now or Message on WhatsApp.",
    images: ["/hero-video-poster.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon-64.png', type: 'image/png', sizes: '64x64' },
      { url: '/assets/denish-logo-icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/denish-logo-square.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneRepairStore",
    name: BUSINESS_CONFIG.name,
    telephone: "+91-8511668848",
    slogan: BUSINESS_CONFIG.tagline,
    description:
      "Professional mobile repair shop in Gandhinagar providing screen replacement, battery replacement, charging port repair, IC/PCB micro-soldering, and software solutions.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gandhinagar",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
  };

  const themeScript = `
    (function() {
      try {
        var stored = localStorage.getItem('denish_theme');
        var theme = stored || 'light';
        var isDark = false;
        if (theme === 'dark') {
          isDark = true;
        } else if (theme === 'system') {
          isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200`}>
        <ThemeProvider>
          <GitHubThemeProvider>
            {children}
          </GitHubThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
