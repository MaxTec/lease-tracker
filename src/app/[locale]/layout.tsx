import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Providers from "@/components/Providers";
import TimeZoneWrapper from "@/components/providers/TimeZoneWrapper";
import DeviceWrapper from "@/components/providers/DeviceWrapper";
import { isMobileDevice } from "@/utils/device-detection";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Locale, locales, defaultLocale } from "@/i18n/settings";

// import {NextIntlClientProvider, hasLocale} from 'next-intl';
// import {routing} from '@/i18n/routing';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Validate locale or use default
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale;
  await getTranslations({ locale: validLocale }); // Get translations to ensure locale is loaded
  
  const baseUrl = "https://yourdomain.com"; // TODO: Replace with your actual domain
  const pageUrl = `${baseUrl}/${validLocale}`;

  return {
    title: "LeaseTracker – Property & Lease Management",
    description:
      "Easily manage your properties, tenants, and leases with LeaseTracker. Secure, modern, and efficient property management for landlords and tenants.",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "LeaseTracker – Property & Lease Management",
      description:
        "Easily manage your properties, tenants, and leases with LeaseTracker.",
      url: pageUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "LeaseTracker – Property & Lease Management",
      description:
        "Easily manage your properties, tenants, and leases with LeaseTracker.",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Validate locale or use default
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale;
  const messages = await getMessages({ locale: validLocale });
  const isMobile = await isMobileDevice();

  return (
    <html lang={validLocale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={validLocale} messages={messages}>
          <Providers>
            <TimeZoneWrapper>
              <DeviceWrapper isMobile={isMobile}>
                {children}
              </DeviceWrapper>
            </TimeZoneWrapper>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 