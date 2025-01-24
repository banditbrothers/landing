"use client";

import { whatsappKnowMoreLink } from "@/utils/whatsappMessageLinks";
import { FullLogo } from "./misc/fullLogo";
import Link from "next/link";
import { scrollTo } from "@/utils/misc";
import { PaymentBadges } from "./payments/PaymentBadges";
import useIsMobile from "@/hooks/useIsMobile";

export default function Footer() {
  const isMobile = useIsMobile();

  return (
    <footer className="bg-primary-50 text-primary-600 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <Link
              href="/"
              onClick={e => {
                e.preventDefault();
                scrollTo("hero");
              }}>
              <FullLogo size={180} />
            </Link>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/privacy" className="hover:text-primary-800 transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-800 transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href={whatsappKnowMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-800 transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className={`flex ${isMobile ? "justify-center mt-4" : "justify-end"} `}>
          <PaymentBadges />
        </div>

        <div className="mt-8 text-center text-sm">
          © {new Date().getFullYear()} Bandit Brothers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
