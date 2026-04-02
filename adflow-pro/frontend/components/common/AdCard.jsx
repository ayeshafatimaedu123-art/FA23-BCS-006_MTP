/**
 * Ad Card Component
 */

import Link from 'next/link';
import Image from 'next/image';

export default function AdCard({ ad }) {
  return (
    <Link href={`/ads/${ad.slug}`}>
      <div className="card hover:shadow-lg transition group cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          {ad.media && ad.media[0] ? (
            <Image
              src={ad.media[0].url}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
              width={300}
              height={200}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600">
            {ad.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {ad.description}
          </p>

          {/* Meta */}
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-blue-600">
              Rs. {ad.price?.toLocaleString()}
            </div>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {ad.package?.name || 'Basic'}
            </span>
          </div>

          {/* Location */}
          <div className="text-xs text-gray-500 mt-2">
            📍 {ad.city?.name || 'Unknown'}
          </div>
        </div>
      </div>
    </Link>
  );
}
