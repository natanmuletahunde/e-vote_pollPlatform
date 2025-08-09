'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          PollHub
        </Link>
        
        <div className="flex items-center space-x-4">
          {status === 'authenticated' ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary">
                Dashboard
              </Link>
              <Link href="/polls/create" className="text-gray-700 hover:text-primary">
                Create Poll
              </Link>
              <button 
                onClick={() => signOut()}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Sign Out
              </button>
              <span className="text-sm text-gray-600">{session.user.name}</span>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-primary">
                Login
              </Link>
              <Link href="/auth/register" className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}