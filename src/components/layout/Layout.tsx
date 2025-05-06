'use client';

import { Header, Footer } from '@/components/layout';
import { Toaster } from 'react-hot-toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export default function Layout({ children, showBreadcrumbs = true }: LayoutProps) {
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-4">
          {showBreadcrumbs && <Breadcrumbs />}
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
} 