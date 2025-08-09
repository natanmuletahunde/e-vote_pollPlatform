'use client';
import Link from 'next/link';
import { FaTwitter, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-gray-700 shadow-lg z-40 h-14 transition-all duration-300">
      <div className="container mx-auto px-4 h-full">
        <div className="flex flex-col md:flex-row justify-between items-center h-full">
          {/* Copyright */}
          <div className="text-xs text-gray-300 mb-1 md:mb-0 hover:bg-white hover:text-[#0f172a] px-2 py-1 rounded transition-colors duration-300">
            &copy; {new Date().getFullYear()} PollHub
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-2 h-full">
            <Link 
              href="/privacy" 
              className="text-xs text-gray-300 hover:bg-white hover:text-[#0f172a] px-3 py-1 rounded transition-colors duration-300"
            >
              Privacy
            </Link>
            <span className="text-gray-500">|</span>
            <Link 
              href="/terms" 
              className="text-xs text-gray-300 hover:bg-white hover:text-[#0f172a] px-3 py-1 rounded transition-colors duration-300"
            >
              Terms
            </Link>
            <span className="text-gray-500">|</span>
            <Link 
              href="/contact" 
              className="text-xs text-gray-300 hover:bg-white hover:text-[#0f172a] px-3 py-1 rounded transition-colors duration-300"
            >
              Contact
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4 h-full items-center">
            <a 
              href="#" 
              className="text-gray-300 hover:bg-white hover:text-[#0f172a] p-2 rounded-full transition-colors duration-300"
            >
              <FaTwitter size={14} />
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:bg-white hover:text-[#0f172a] p-2 rounded-full transition-colors duration-300"
            >
              <FaGithub size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}