/**
 * Admin Dashboard
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Manage platform operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-gray-600 text-sm">Total Users</div>
            <div className="text-3xl font-bold">1,240</div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm">Active Ads</div>
            <div className="text-3xl font-bold">842</div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm">Total Revenue</div>
            <div className="text-3xl font-bold">Rs. 2.4M</div>
          </div>
          <div className="card">
            <div className="text-gray-600 text-sm">Pending Payments</div>
            <div className="text-3xl font-bold">42</div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/payment-queue" className="card hover:shadow-lg transition border-l-4 border-blue-600">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">Payment Queue</h3>
            <p className="text-sm text-gray-600">42 payments pending verification</p>
          </Link>

          <Link href="/dashboard/admin/users" className="card hover:shadow-lg transition border-l-4 border-green-600">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">Users</h3>
            <p className="text-sm text-gray-600">Manage user accounts</p>
          </Link>

          <Link href="/dashboard/admin/analytics" className="card hover:shadow-lg transition border-l-4 border-purple-600">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">View platform statistics</p>
          </Link>

          <Link href="/dashboard/admin/categories" className="card hover:shadow-lg transition border-l-4 border-orange-600">
            <div className="text-2xl mb-2">🏷️</div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <p className="text-sm text-gray-600">Manage ad categories</p>
          </Link>

          <Link href="/dashboard/admin/settings" className="card hover:shadow-lg transition border-l-4 border-red-600">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Configure platform settings</p>
          </Link>

          <Link href="/dashboard/admin/logs" className="card hover:shadow-lg transition border-l-4 border-gray-600">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold mb-2">Audit Logs</h3>
            <p className="text-sm text-gray-600">View system activity</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
