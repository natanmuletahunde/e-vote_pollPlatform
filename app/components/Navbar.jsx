'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0f172a] border-b border-gray-700 shadow-lg z-50 h-16 transition-all duration-300">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        <Link 
          href="/" 
          className="text-xl font-bold text-white hover:bg-white hover:text-[#0f172a] px-3 py-1 rounded transition-colors duration-300"
        >
          PollHub
        </Link>
        
        <div className="flex items-center space-x-2 h-full">
          {status === 'authenticated' ? (
            <>
              <Link 
                href="/dashboard" 
                className="h-full flex items-center px-4 text-gray-300 hover:bg-white hover:text-[#0f172a] transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link 
                href="/polls/create" 
                className="h-full flex items-center px-4 text-gray-300 hover:bg-white hover:text-[#0f172a] transition-colors duration-300"
              >
                Create Poll
              </Link>
              <button 
                onClick={() => signOut()}
                className="h-full flex items-center px-4 text-gray-300 hover:bg-white hover:text-[#0f172a] transition-colors duration-300"
              >
                Sign Out
              </button>
              <span className="text-sm text-white ml-2 px-3 py-1 bg-blue-600 rounded-full">
                {session.user.name}
              </span>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="h-full flex items-center px-4 text-gray-300 hover:bg-white hover:text-[#0f172a] transition-colors duration-300"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="h-full flex items-center px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}