/**
 * Header Component  
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            AdFlow Pro
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex gap-6">
          <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition">
            Explore Ads
          </Link>
          <Link href="/packages" className="text-gray-700 hover:text-blue-600 transition">
            Packages
          </Link>
          {!isAuthenticated && (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex gap-2">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-sm text-gray-700">
                Login
              </Link>
              <Link href="/register" className="text-sm btn btn-primary py-2 px-3">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm text-gray-700">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
