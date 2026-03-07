'use client';

import { useEffect, useState } from 'react';
import { logoutAction } from '@/actions/auth';
import Image from 'next/image';
import { getUser } from '@/actions/user';
import { createStore } from '@/actions/store';
import { User } from '@prisma/client';
import Link from 'next/link';

interface UserProfile extends User {
  store?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    orders: number;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateStore, setIsCreateStore] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeError, setStoreError] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (err) {
        console.error('ProfilePage: Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleStoreCreation = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const trimmedName = storeName.trim();

    setIsCreatingStore(true);
    setStoreError('');

    try {
      await createStore(trimmedName);
      const updatedUser = await getUser();
      setUser(updatedUser);
      setIsCreateStore(false);
      setStoreName('');
    } catch (err) {
      setStoreError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setIsCreatingStore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Profile</h1>
          <p className="text-gray-600 mb-6">{error || 'Please try logging in again'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User avatar'}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.name || 'User Profile'}
              </h1>
              <p className="text-gray-600 text-lg mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {user.role}
                </span>
                {user.store && (
                  <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Store Owner
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Details</h2>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-lg font-medium text-gray-900">{user.email}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-medium text-gray-900">
                {user.name || 'Not provided'}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Account Role</p>
              <p className="text-lg font-medium text-gray-900">{user.role}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(user.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Store Information */}
        {user.store ? (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Store Information</h2>
            
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Store Name</p>
              <p className="text-lg font-medium text-gray-900">{user.store.name}</p>
            </div>

            <div className="mt-4">
              <a
                href="/products"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Manage Store
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Store Yet</h3>
            <p className="text-blue-800 mb-4">
              Create a store to start selling products on our marketplace.
            </p>
            <button 
              onClick={() => setIsCreateStore(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Store
            </button>
          </div>
        )}

        {/* Store Creation Modal */}
        {isCreateStore && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 transform transition-all"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Store</h2>
                <p className="text-gray-600">
                  Choose a name for your store to start selling products.
                </p>
              </div>

              <form
                onSubmit={handleStoreCreation}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="storename"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Store Name
                  </label>
                  <input
                    type="text"
                    id="storename"
                    name="storename"
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value);
                      setStoreError('');
                    }}
                    placeholder="e.g., My Awesome Store"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                    disabled={isCreatingStore}
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  {storeError && (
                    <p className="mt-2 text-sm text-red-600">{storeError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {storeName.length}/50 characters
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateStore(false);
                      setStoreName('');
                      setStoreError('');
                    }}
                    disabled={isCreatingStore}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingStore || !storeName.trim()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCreatingStore ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Store'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Orders Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Activity</h2>
          
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {user._count?.orders || 0}
            </p>
            <p className="text-gray-600">Total Orders</p>
          </div>

          <Link
            href="/orders"
            className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-lg transition"
          >
            View All Orders
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center">
          <button
            onClick={() => logoutAction()}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
