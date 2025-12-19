import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";

import { CSPostHogProvider } from "@/provider/posthog";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { MetaPixelProvider } from "@/provider/metaPixel";

import { TanstackQueryProvider } from "@/provider/TanstackQuery";

const Calera = localFont({
  src: "../fonts/calera-display-regular-400.otf",
  variable: "--font-calera",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bandit Brothers - Wear your Mischief",
  description: "One Stop Shop for your Bandana Needs",
  openGraph: {
    images: "/logo-full-socials.png",
    type: "website",
  },
  twitter: {
    images: "/logo-full-socials.png",
    card: "summary_large_image",
  },
  other: {
    "google-site-verification": "PKSwI99CoRqBVviv78Ad1KU1KVOkSrGk_CuICBrk0M8",
  },
};

const theme = "dark";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${theme}`}>
      <head>
        <meta name="facebook-domain-verification" content="bhok31r0uqvk61om2yf0l4r9l6v9bs" />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1023145726553010&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={`${spaceGrotesk.className} ${Calera.className}`}>
        <MetaPixelProvider>
          <CSPostHogProvider>
            <TanstackQueryProvider>
              <Toaster theme={theme} richColors position="top-right" expand />
              <main>
                <Navbar />
                {children}
                <Footer />
              </main>
            </TanstackQueryProvider>
          </CSPostHogProvider>
        </MetaPixelProvider>
      </body>
    </html>
  );
}
