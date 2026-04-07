'use client';

import { SubmitEvent, useState } from 'react';
import Image from 'next/image';
import { User } from '@prisma/client';
import { updateUser } from '@/actions/user';
import CloudinaryUploadButton from '@/components/CloudinaryUploadButton';

interface UserManagerProps {
  user: User;
}

export default function UserManager({ user }: UserManagerProps) {
  const [isUpdateUser, setIsUpdateUser] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateImage, setUpdateImage] = useState<string>('');
  const [updatePhone, setUpdatePhone] = useState('');
  const [updateAddress, setUpdateAddress] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [updateUserError, setUpdateUserError] = useState('');

  async function handleUserUpdation(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdatingUser(true);
    setUpdateUserError('');

    try {
      const response = await updateUser({
        name: updateName || undefined,
        image: updateImage || undefined,
        phone: updatePhone || undefined,
        address: updateAddress || undefined,
      });

      if (!response.success) {
        setUpdateUserError(response.error || 'Failed to update profile');
        return;
      }

      setIsUpdateUser(false);
    } catch (err) {
      setUpdateUserError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdatingUser(false);
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
          <button
            onClick={() => {
              setUpdateName(user?.name || '');
              setUpdateImage(user?.image || '');
              setUpdatePhone(user?.phone || '');
              setUpdateAddress(user?.address || '');
              setUpdateUserError('');
              setIsUpdateUser(true);
            }}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
          >
            Update
          </button>
        </div>

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
            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
            <p className="text-lg font-medium text-gray-900">
              {user.phone || 'Not provided'}
            </p>
          </div>
          
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600 mb-1">Address</p>
            <p className="text-lg font-medium text-gray-900">
              {user.address || 'Not provided'}
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

      {isUpdateUser && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 transform transition-all">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Update Profile</h2>
              <p className="text-gray-600">Change your display name or profile picture.</p>
            </div>

            <form onSubmit={handleUserUpdation} className="space-y-4">
              <div>
                <label htmlFor="updateName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="updateName"
                  value={updateName}
                  onChange={(e) => {
                    setUpdateName(e.target.value);
                    setUpdateUserError('');
                  }}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  disabled={isUpdatingUser}
                  required
                />
              </div>

              <div>
                <label htmlFor="updatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="updatePhone"
                  value={updatePhone}
                  onChange={(e) => {
                    setUpdatePhone(e.target.value);
                    setUpdateUserError('');
                  }}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  disabled={isUpdatingUser}
                  required
                />
              </div>

              <div>
                <label htmlFor="updateAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="updateAddress"
                  value={updateAddress}
                  onChange={(e) => {
                    setUpdateAddress(e.target.value);
                    setUpdateUserError('');
                  }}
                  placeholder="Enter address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  disabled={isUpdatingUser}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>

                {updateImage && (
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={updateImage}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-[80px] h-[80px]"
                    />
                  </div>
                )}

                <CloudinaryUploadButton
                  multiple={false}
                  disabled={isUpdatingUser}
                  onUpload={(url) => {
                    setUpdateImage(url);
                    setUpdateUserError('');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Image
                </CloudinaryUploadButton>
              </div>

              {updateUserError && <p className="mt-2 text-sm text-red-600">{updateUserError}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateUser(false);
                    setUpdateName('');
                    setUpdateImage('');
                    setUpdateUserError('');
                  }}
                  disabled={isUpdatingUser}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser || !updateName.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdatingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}