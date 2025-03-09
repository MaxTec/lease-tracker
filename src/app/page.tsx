'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import RegisterForm from '@/components/auth/RegisterForm';
import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
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
          <Logo />
          <h1 className="text-3xl font-bold text-white mt-4">Welcome to</h1>
          <h2 className="text-4xl font-bold text-white">LeaseTracker</h2>
        </div>
        
        <p className="text-blue-100 mb-auto">
          Simplify your property management with our comprehensive lease tracking solution.
          Manage properties, track payments, and generate vouchers all in one place.
        </p>

        <div className="text-blue-200 text-sm hidden lg:block">
          <span>CREATION HERE</span>
          <span className="mx-2">|</span>
          <span>DESIGNED HERE</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
        {showLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} />
        )}
      </div>
    </main>
  );
}
