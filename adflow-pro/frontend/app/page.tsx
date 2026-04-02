// Frontend - Home Page
'use client';

import Link from 'next/link';
import SearchBar from '@/components/public/SearchBar';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Reach Your Target Audience
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Post your ads on AdFlow Pro and connect with thousands of potential customers
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Choose AdFlow Pro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Account
            </Link>
            <Link
              href="/ads"
              className="bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-400"
            >
              Browse Ads
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: '🚀',
    title: 'Quick Publishing',
    description: 'Get your ad published in minutes with our simple and intuitive process',
  },
  {
    icon: '👥',
    title: 'Wide Reach',
    description: 'Connect with thousands of active users looking for your products/services',
  },
  {
    icon: '✨',
    title: 'Premium Features',
    description: 'Featured placement, media support, and analytics to maximize visibility',
  },
];
