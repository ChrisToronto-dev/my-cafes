'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Coffee, Plus, LogIn, LogOut } from 'lucide-react';

const Header = () => {
  const { data: session, status } = useSession();

  return (
    <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Coffee className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">MyCafe</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/cafes/add" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Cafe
            </Link>
            {status === 'unauthenticated' && (
              <Link href="/login" className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent">
                <LogIn className="mr-2 h-5 w-5"/>
                Login
              </Link>
            )}
            {status === 'authenticated' && (
              <button onClick={() => signOut()} className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent">
                <LogOut className="mr-2 h-5 w-5"/>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
