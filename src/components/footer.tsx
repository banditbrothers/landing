import { whatsappKnowMoreLink } from "@/utils/whatsappMessageLinks";
import { FullLogo } from "./fullLogo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-50 text-primary-600 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <FullLogo size={180} />
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-800 transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-800 transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href={whatsappKnowMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-800 transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm">
          © {new Date().getFullYear()} Bandit Brothers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
