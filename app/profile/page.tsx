import { getUser } from '@/actions/user';
import Image from 'next/image';
import { User, UserRole } from '@prisma/client';
import StoreManager from '@/components/StoreManager';
import UserManager from '@/components/UserManager';

interface UserProfile extends User {
  stores?: {
    id: string;
    name: string;
  }[];
}

export default async function ProfilePage() {
  const response = await getUser();

  if (response.error || !response.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Profile</h1>
          <p className="text-gray-600 mb-6">{response.error || 'Please try logging in again'}</p>
        </div>
      </div>
    );
  }

  const user = response.data as UserProfile;
  const primaryStore = user.stores?.[0] ?? null;
  console.log(user.role)
  console.log(user.stores)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User avatar'}
                  width={120}
                  height={120}
                  className="rounded-full object-cover w-[120px] h-[120px]"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.name || 'User Profile'}
              </h1>
              <p className="text-gray-600 text-lg mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {user.role}
                </span>
                {primaryStore && (
                  <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Store Owner
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <UserManager user={user} />

        { user.role === UserRole.ADMIN && <StoreManager primaryStore={primaryStore} /> }
      </div>
    </div>
  );
}