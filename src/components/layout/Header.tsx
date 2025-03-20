"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Weather from "./Weather";
import Logo from "../ui/Logo";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return <div>Unauthenticated</div>;
  }

  return (
    <header className='bg-white shadow-md'>
      <div className='container mx-auto px-4 py-4'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='text-xl font-bold text-gray-800'>
            <Logo size={170} color='black' />
          </Link>

          <div className='flex items-center space-x-8'>
            {/* <Weather session={session} /> */}

            <div className='space-x-6'>
              <Link href='/leases' className='text-gray-600 hover:text-gray-900'>
                Leases
              </Link>
              {session?.user?.role === "ADMIN" && (
                <>
                  <Link href='/properties' className='text-gray-600 hover:text-gray-900'>
                    Properties
                  </Link>
                  <Link href='/tenants' className='text-gray-600 hover:text-gray-900'>
                    Tenants
                  </Link>
                </>
              )}
              {/* <Link href='/settings' className='text-gray-600 hover:text-gray-900'>
                Settings
              </Link> */}
            </div>

            {session?.user && (
              <div className='flex items-center space-x-3 border-l pl-6'>
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>{session.user.name}</div>
                  <div className='text-xs text-gray-500'>{session.user.role}</div>
                </div>
                <button
                  className='text-gray-600 hover:text-gray-900'
                  onClick={() => {
                    signOut();
                  }}
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
