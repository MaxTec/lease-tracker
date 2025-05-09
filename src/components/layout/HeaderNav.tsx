"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Weather from "./Weather";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";

interface HeaderNavProps {
  session: Session | null;
}

export default function HeaderNav({ session }: HeaderNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        type="button"
        className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <span className="sr-only">Open main menu</span>
        {/* Icon when menu is closed */}
        <svg
          className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        {/* Icon when menu is open */}
        <svg
          className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-8">
        {/* <Weather session={session} /> */}
        <div className="space-x-6">
          {session && session?.user?.role !== "TENANT" && (
            <>
              <Link
                href="/leases"
                className="text-gray-600 hover:text-gray-900"
              >
                {t("common.navigation.leases")}
              </Link>
              <Link
                href="/properties"
                className="text-gray-600 hover:text-gray-900"
              >
                {t("common.navigation.properties")}
              </Link>
              <Link
                href="/tenants"
                className="text-gray-600 hover:text-gray-900"
              >
                {t("common.navigation.tenants")}
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/landlords"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t("common.navigation.landlords")}
                </Link>
              )}
              <Link
                href="/tickets"
                className="text-gray-600 hover:text-gray-900"
              >
                {t("common.navigation.tickets")}
              </Link>
            </>
          )}
        </div>
        <LanguageSwitcher />
        {session?.user && (
          <div className="flex items-center space-x-3 border-l pl-6">
            <div className="text-right">
              <Weather session={session} />
            </div>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => {
                signOut();
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div
        className={`$${isMobileMenuOpen ? "block" : "hidden"} lg:hidden mt-4 pb-3 border-t border-gray-200`}
        id="mobile-menu"
      >
        <div className="space-y-3 pt-3">
          <Link
            href="/leases"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            {t("common.navigation.leases")}
          </Link>
          {session?.user?.role === "ADMIN" && (
            <>
              <Link
                href="/properties"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {t("common.navigation.properties")}
              </Link>
              <Link
                href="/tenants"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {t("common.navigation.tenants")}
              </Link>
              <Link
                href="/landlords"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {t("common.navigation.landlords")}
              </Link>
            </>
          )}
          <Link
            href="/tickets"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            {t("common.navigation.tickets")}
          </Link>
          {/* Language Switcher Mobile */}
          <div className="px-3 py-2 mt-2">
            <LanguageSwitcher />
          </div>
        </div>
        {session?.user && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="px-3 flex items-center">
              <div className="flex-grow">
                <div className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {session.user.role}
                </div>
              </div>
              <button
                className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  signOut();
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 