'use client';

import { SubmitEvent, useState } from 'react';
import { createStore, updateStore, deleteStore } from '@/actions/store';
import ConfirmModal from '@/components/ConfirmModal';

interface StoreSummary {
  id: string;
  name: string;
}

interface StoreManagerProps {
  primaryStore: StoreSummary | null;
}

export default function StoreManager({ primaryStore }: StoreManagerProps) {
  const [isCreateStore, setIsCreateStore] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeError, setStoreError] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const [isEditingStoreName, setIsEditingStoreName] = useState(false);
  const [editingStoreName, setEditingStoreName] = useState('');
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);
  const [updateStoreError, setUpdateStoreError] = useState('');

  const [isDeletingStore, setIsDeletingStore] = useState(false);
  const [deleteStoreError, setDeleteStoreError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  async function handleStoreDeletion() {
    setIsDeletingStore(true);
    setDeleteStoreError('');

    try {
      const response = await deleteStore();
      if (!response.success) {
        setDeleteStoreError(response.error || 'Failed to delete store');
        return;
      }
      setIsDeleteModalOpen(false);
    } catch (err) {
      setDeleteStoreError(err instanceof Error ? err.message : 'Failed to delete store');
    } finally {
      setIsDeletingStore(false);
    }
  }

  async function handleStoreCreation(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = storeName.trim();
    if (!trimmedName) {
      setStoreError('Store name cannot be empty');
      return;
    }

    setIsCreatingStore(true);
    setStoreError('');

    try {
      const createResult = await createStore(trimmedName);
      if (!createResult.success) {
        setStoreError(createResult.error || 'Failed to create store');
        return;
      }

      setIsCreateStore(false);
      setStoreName('');
    } catch (err) {
      setStoreError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setIsCreatingStore(false);
    }
  }

  async function handleStoreUpdation(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingStoreName.trim()) {
      setUpdateStoreError('Store name cannot be empty');
      return;
    }

    if (editingStoreName.trim() === primaryStore?.name) {
      setIsEditingStoreName(false);
      return;
    }

    setIsUpdatingStore(true);
    setUpdateStoreError('');

    try {
      const response = await updateStore(editingStoreName);

      if (!response.success) {
        setUpdateStoreError(response.error || 'Failed to update store');
        return;
      }

      setIsEditingStoreName(false);
    } catch (err) {
      setUpdateStoreError(err instanceof Error ? err.message : 'Failed to update store');
    } finally {
      setIsUpdatingStore(false);
    }
  }

  return (
    <>
      {/* Existing store management section */}
      {primaryStore ? (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Store Information</h2>

          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600">Store Name</p>
              {!isEditingStoreName && (
                <button
                  onClick={() => {
                    setEditingStoreName(primaryStore.name);
                    setUpdateStoreError('');
                    setIsEditingStoreName(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingStoreName ? (
              <form onSubmit={handleStoreUpdation} className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={editingStoreName}
                    onChange={(e) => {
                      setEditingStoreName(e.target.value);
                      setUpdateStoreError('');
                    }}
                    className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 shrink min-w-0"
                    disabled={isUpdatingStore}
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingStore || !editingStoreName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isUpdatingStore ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingStoreName(false)}
                    disabled={isUpdatingStore}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
                {updateStoreError && (
                  <p className="text-sm text-red-600">{updateStoreError}</p>
                )}
              </form>
            ) : (
              <p className="text-lg font-medium text-gray-900">{primaryStore.name}</p>
            )}
          </div>

          <div className="mt-4 flex gap-4 items-center">
            <a
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Manage Store
            </a>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeletingStore}
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isDeletingStore ? 'Deleting...' : 'Delete Store'}
            </button>
          </div>
          {deleteStoreError && (
            <p className="mt-2 text-sm text-red-600">{deleteStoreError}</p>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6">
          {/* Store creation section */}
          <h3 className="text-lg font-semibold text-blue-900 mb-2">No Store Yet</h3>
          <p className="text-blue-800 mb-4">
            Create a store to start selling products on our marketplace.
          </p>
          {isCreateStore ? (
            <form onSubmit={handleStoreCreation} className="flex flex-col gap-2 mt-2">
              <div className="flex gap-2 whitespace-nowrap">
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
                  className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 shrink min-w-0"
                  disabled={isCreatingStore}
                  required
                  minLength={3}
                  maxLength={50}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isCreatingStore || !storeName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isCreatingStore ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateStore(false);
                    setStoreName('');
                    setStoreError('');
                  }}
                  disabled={isCreatingStore}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
              {storeError && <p className="text-sm text-red-600">{storeError}</p>}
              <p className="text-xs text-blue-700">{storeName.length}/50 characters</p>
            </form>
          ) : (
            <button
              onClick={() => setIsCreateStore(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Store
            </button>
          )}
        </div>
      )}

      {/* Store deletion confirmation modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleStoreDeletion}
        title="Delete Store"
        message="Are you sure you want to delete your store? This action cannot be undone and will archive all associated products."
        isLoading={isDeletingStore}
      />
    </>
  );
}