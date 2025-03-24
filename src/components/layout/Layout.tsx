'use client';

import { Header, Footer } from '@/components/layout';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-4">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
} 