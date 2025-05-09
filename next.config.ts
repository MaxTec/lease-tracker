import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/index.ts');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagsapi.com',
        pathname: '**',
      },
    ],
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Increase as needed
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // ajusta según el uso esperado
    },
  },
};

export default withNextIntl(nextConfig);
