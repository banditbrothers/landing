import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";

import { CSPostHogProvider } from "@/provider/posthog";

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
    images: "/logo-full-socials.webp",
    type: "website",
  },
  twitter: {
    images: "/logo-full-socials.webp",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} ${Calera.className}`}>
        <CSPostHogProvider>{children}</CSPostHogProvider>
      </body>
    </html>
  );
}
