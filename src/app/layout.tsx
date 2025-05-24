import "./globals.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";

import { CSPostHogProvider } from "@/provider/posthog";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { SearchDialog } from "@/components/dialogs/SearchDialog";
import { CartSheet } from "@/components/sheets/CartSheet";

import { TanstackQueryProvider } from "@/provider/TanstackQuery";
const PixelTracker = dynamic(() => import("@/components/pixel-tracker/PixelTracker"), { ssr: false });

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
const PIXEL_ID = "1023145726553010";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${theme}`}>
      <head>
        <script
          id="facebook-pixel"
          dangerouslySetInnerHTML={{
            __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
          }}></script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>
      <body className={`${spaceGrotesk.className} ${Calera.className}`}>
        <CSPostHogProvider>
          <TanstackQueryProvider>
            <Toaster theme={theme} richColors position="top-right" />
            <main>
              <Navbar />
              <PixelTracker />
              {children}
              <Footer />
            </main>
            <SearchDialog />
            <CartSheet />
          </TanstackQueryProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
