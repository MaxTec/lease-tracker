import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();
  
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              {t("common.navigation.contact")}
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              {t("common.navigation.privacy")}
            </Link>
            <a
              href="mailto:support@leasetracker.com"
              className="text-gray-600 hover:text-gray-900"
            >
              support@leasetracker.com
            </a>
          </div>

          {/* Gray Luxury Gradient Divider */}
          <div className="flex justify-center items-center">
            <div className="h-[1px] bg-gradient-to-l from-gray-300 to-transparent w-32" />
            <div className="h-[1px] bg-gradient-to-r from-gray-300 to-transparent w-32" />
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <Link
              href={process.env.NEXT_PUBLIC_AUTHOR_SOCIAL_MEDIA_FACEBOOK || ""}
              className="hover:text-gray-600 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebook className="w-4 h-4" />
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_AUTHOR_SOCIAL_MEDIA_X || ""}
              className="hover:text-gray-600 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-4 h-4" />
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_AUTHOR_SOCIAL_MEDIA_INSTAGRAM || ""}
              className="hover:text-gray-600 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4" />
            </Link>
          </div>

          <div className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} LeaseTracker. {t("home.rightsReserved")}.
            <br />
            {t("home.developedBy")}{" "}
            <Link
              href="https://maximilianotec.site"
              className="text-gray-600 hover:text-gray-900"
            >
              Maximiliano Tec
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
