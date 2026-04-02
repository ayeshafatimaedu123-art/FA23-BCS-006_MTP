/**
 * Create Ad Form Component
 */

'use client';

import { useState } from 'react';
import { adsAPI } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export default function CreateAdForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    cityId: '',
    packageId: '',
    media: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adsAPI.create(formData);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Create New Ad</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="Enter ad title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="input w-full"
              placeholder="Describe your ad..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Price (Rs.) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Package *</label>
              <select
                name="packageId"
                value={formData.packageId}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select package</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select category</option>
                <option value="1">Electronics</option>
                <option value="2">Real Estate</option>
                <option value="3">Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">City *</label>
              <select
                name="cityId"
                value={formData.cityId}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select city</option>
                <option value="1">Karachi</option>
                <option value="2">Lahore</option>
                <option value="3">Islamabad</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating...' : 'Create Ad'}
          </button>
        </form>
      </div>
    </div>
  );
}
