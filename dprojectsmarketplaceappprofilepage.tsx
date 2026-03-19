import { getUser } from '@/actions/user';
import ProfileUI from '@/components/ProfileUI';

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

  return <ProfileUI user={response.data} />;
}
