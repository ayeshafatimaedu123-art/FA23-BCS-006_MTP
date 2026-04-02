/**
 * Client Dashboard
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
            <p className="text-gray-600">Manage your ads and payments</p>
          </div>
          <Link href="/create-ad" className="btn btn-primary">
            + Create Ad
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-gray-600 text-sm">Active Ads</div>
            <div className="text-3xl font-bold">12</div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm">Total Views</div>
            <div className="text-3xl font-bold">1,240</div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm">Total Spent</div>
            <div className="text-3xl font-bold">Rs. 24,999</div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm">Response Rate</div>
            <div className="text-3xl font-bold">8.3%</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/client/ads" className="card hover:shadow-lg transition">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold mb-2">My Ads</h3>
            <p className="text-sm text-gray-600">View and manage all your ads</p>
          </Link>

          <Link href="/dashboard/client/payments" className="card hover:shadow-lg transition">
            <div className="text-2xl mb-2">💳</div>
            <h3 className="font-semibold mb-2">Payments</h3>
            <p className="text-sm text-gray-600">View payment history</p>
          </Link>

          <Link href="/dashboard/client/settings" className="card hover:shadow-lg transition">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Manage your profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
