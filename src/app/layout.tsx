import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import TimeZoneWrapper from "@/components/providers/TimeZoneWrapper";
import DeviceWrapper from "@/components/providers/DeviceWrapper";
import { isMobileDevice } from "@/utils/device-detection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Move metadata to a separate file since we're using 'use client'
export const metadata = {
  title: "LeaseTracker",
  description: "Property management and lease tracking solution",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = await isMobileDevice();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <TimeZoneWrapper>
            <DeviceWrapper isMobile={isMobile}>
              {children}
            </DeviceWrapper>
          </TimeZoneWrapper>
        </Providers>
      </body>
    </html>
  );
}
