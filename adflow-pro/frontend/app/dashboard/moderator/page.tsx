/**
 * Moderator Dashboard
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ModeratorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || user?.role !== 'moderator') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Moderator Dashboard</h1>
          <p className="text-gray-600 mb-8">Review and manage ad submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-yellow-50 border-l-4 border-yellow-400">
            <div className="text-gray-600 text-sm">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600">24</div>
          </div>
          <div className="card bg-green-50 border-l-4 border-green-400">
            <div className="text-gray-600 text-sm">Approved Today</div>
            <div className="text-3xl font-bold text-green-600">8</div>
          </div>
          <div className="card bg-red-50 border-l-4 border-red-400">
            <div className="text-gray-600 text-sm">Rejected Today</div>
            <div className="text-3xl font-bold text-red-600">3</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/moderator/review-queue" className="card hover:shadow-lg transition">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold mb-2">Review Queue</h3>
            <p className="text-sm text-gray-600">24 ads waiting for review</p>
          </Link>

          <Link href="/dashboard/moderator/flagged" className="card hover:shadow-lg transition">
            <div className="text-2xl mb-2">🚩</div>
            <h3 className="font-semibold mb-2">Flagged Content</h3>
            <p className="text-sm text-gray-600">Review flagged media</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
