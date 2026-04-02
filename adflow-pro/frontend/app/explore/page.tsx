/**
 * Explore Ads Page
 */

'use client';

import { useState, useEffect } from 'react';
import { adsAPI } from '@/lib/api/client';
import AdCard from '@/components/common/AdCard';
import Link from 'next/link';

export default function ExploreAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    cityId: '',
    sort: 'latest',
    page: 1,
    limit: 12
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await adsAPI.search(filters);
        setAds(response.data);
        setTotal(response.pagination?.total || 0);
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Explore Ads</h1>
          <Link href="/create-ad" className="btn btn-primary">
            + Create Ad
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="input"
            />

            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="1">Electronics</option>
              <option value="2">Real Estate</option>
              <option value="3">Services</option>
            </select>

            <select
              value={filters.cityId}
              onChange={(e) => setFilters({ ...filters, cityId: e.target.value, page: 1 })}
              className="input"
            >
              <option value="">All Cities</option>
              <option value="1">Karachi</option>
              <option value="2">Lahore</option>
              <option value="3">Islamabad</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="input"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-gray-600">
          Showing {ads.length} of {total} ads
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="spinner"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading ads...</p>
          </div>
        )}

        {/* Ads Grid */}
        {!loading && ads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && ads.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No ads found</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > filters.limit && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
              className="btn"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {filters.page}</span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={ads.length < filters.limit}
              className="btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
