'use client';

import Link from 'next/link';
import { Home, PlusCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6" />
              <span className="text-xl font-semibold">My Cafe</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link href="/cafes/add" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-transform hover:scale-105">
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
              Add Cafe
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
