/**
 * Packages Page
 */

'use client';

import { useState, useEffect } from 'react';
import { publicAPI } from '@/lib/api/client';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await publicAPI.getPackages();
        setPackages(response.data || []);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const packageFeatures = {
    basic: ['5 Ads/month', '7-day visibility', 'Standard support'],
    standard: ['15 Ads/month', '14-day visibility', 'Priority support', 'Basic analytics'],
    premium: ['50 Ads/month', '30-day visibility', 'Premium support', 'Advanced analytics', 'Featured placement'],
    platinum: ['Unlimited Ads', '90-day visibility', '24/7 support', 'Full analytics', 'Premium features', 'Dedicated account manager']
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-gray-600 text-lg">Choose the perfect plan for your business</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading packages...</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['basic', 'standard', 'premium', 'platinum'].map((plan) => (
              <div key={plan} className="card border-2 border-gray-200 hover:border-blue-600 transition">
                <div className="uppercase text-sm font-bold text-blue-600 mb-2">
                  {plan} Plan
                </div>
                <div className="text-3xl font-bold mb-4">
                  Rs. {plan === 'basic' ? '999' : plan === 'standard' ? '2,999' : plan === 'premium' ? '4,999' : '9,999'}
                  <span className="text-sm text-gray-600">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {packageFeatures[plan]?.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="btn btn-primary w-full">
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
