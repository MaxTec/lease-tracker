'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import LoginForm from '@/components/auth/LoginForm';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);


  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-8 lg:p-12 flex flex-col min-h-[40vh] lg:min-h-screen">
        <div className="mb-8">
          <Logo size={250} color='white'/>
        </div>
        <p className="text-blue-100 mb-auto">
          {t('home.description')}
        </p>

        <div className="text-blue-200 text-sm hidden lg:block">
          <span>{t('home.developedBy')} <a href="https://github.com/MaxTec" className="text-blue-100 hover:text-blue-200">MaxTec</a></span>
          <span className="mx-2">|</span>
          <span> {t('home.rightsReserved')} {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
        <LoginForm />
      </div>
    </main>
  );
} 