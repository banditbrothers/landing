import { whatsappKnowMoreLink } from "@/data/socials";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <Logo size={120} />
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-800 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-800 transition-colors duration-300"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href={whatsappKnowMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-800 transition-colors duration-300"
                >
                  Contact Us
                </a>
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
