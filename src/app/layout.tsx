import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";

import { CSPostHogProvider } from "@/provider/posthog";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CartSidebar } from "@/components/sidebar/CartSidebar";

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
};

const theme = "dark";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${theme}`}>
      <body className={`${spaceGrotesk.className} ${Calera.className}`}>
        <CSPostHogProvider>
          <FavoritesProvider>
            <Toaster theme={theme} richColors position="top-right" />
            <main>
              <Navbar />
              {children}
              <Footer />
            </main>
            <CartSidebar />
          </FavoritesProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
