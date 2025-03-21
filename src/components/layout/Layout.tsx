'use client';

import { Header, Footer } from '@/components/layout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-4">
        {children}
      </main>

      <Footer />
    </div>
  );
} 