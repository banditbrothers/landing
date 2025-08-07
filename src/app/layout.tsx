import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";

import { CSPostHogProvider } from "@/provider/posthog";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
        <Script id="facebook-pixel" strategy="beforeInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1023145726553010');
            fbq('track', 'PageView');
          `}
        </Script>
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
      </body>
    </html>
  );
}
