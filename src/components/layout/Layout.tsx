'use client';

import { Header, Footer } from '@/components/layout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col py-4">
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
} 