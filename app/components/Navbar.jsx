'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0f172a] border-b border-gray-700 shadow-lg z-50 h-16 transition-all duration-300">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <Image 
              src="https://play-lh.googleusercontent.com/gVe6IqmsUdPZPI0jS6dSSmEgBNIpAgBbwJlx51lSe_isN8yjNoiXMvxJtqdc64H0RQ" 
              alt="PollHub Logo"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
          <Link 
            href="/" 
            className="text-xl font-bold text-white hover:text-blue-300 transition-colors duration-300"
          >
            PollHub
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 h-full">
          {status === 'authenticated' ? (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center justify-center h-10 px-4 rounded-md text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link 
                href="/polls/create" 
                className="flex items-center justify-center h-10 px-4 rounded-md text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-300"
              >
                Create Poll
              </Link>
              <button 
                onClick={() => signOut()}
                className="flex items-center justify-center h-10 px-4 rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-300"
              >
                Sign Out
              </button>
              <div className="flex items-center ml-4 space-x-3">
                {session.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-blue-500"
                  />
                ) : (
                  <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold">
                    {session.user?.name?.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-white font-medium">
                  {session.user?.name?.split(' ')[0]}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="flex items-center justify-center h-10 px-6 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-300 border border-gray-600"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="flex items-center justify-center h-10 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg font-medium"
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