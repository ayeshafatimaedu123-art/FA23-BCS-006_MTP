/**
 * Dashboard Layout
 * Wrapper for protected dashboard routes
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const getRoleLink = () => {
    if (user?.role === 'client') return '/dashboard/client';
    if (user?.role === 'moderator') return '/dashboard/moderator';
    if (user?.role === 'admin' || user?.role === 'super_admin') return '/dashboard/admin';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-white shadow-lg hidden md:block">
        <div className="p-6 border-b">
          <h2 className="font-bold text-lg">Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">{user?.firstName} ({user?.role})</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href={getRoleLink()} className="block px-4 py-2 rounded hover:bg-gray-100 transition">
            Home
          </Link>
          {user?.role === 'client' && (
            <>
              <Link href="/create-ad" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Create Ad
              </Link>
              <Link href="/dashboard/client/ads" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                My Ads
              </Link>
              <Link href="/dashboard/client/payments" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Payments
              </Link>
            </>
          )}
          {user?.role === 'moderator' && (
            <>
              <Link href="/dashboard/moderator/review-queue" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Review Queue
              </Link>
              <Link href="/dashboard/moderator/flagged" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Flagged Content
              </Link>
            </>
          )}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <>
              <Link href="/dashboard/admin/payment-queue" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Payment Queue
              </Link>
              <Link href="/dashboard/admin/users" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Users
              </Link>
              <Link href="/dashboard/admin/analytics" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
                Analytics
              </Link>
            </>
          )}

          <hr className="my-4" />

          <Link href="/profile" className="block px-4 py-2 rounded hover:bg-gray-100 transition">
            Profile
          </Link>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 rounded hover:bg-red-50 text-red-600 transition"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {children}
      </div>
    </div>
  );
}
