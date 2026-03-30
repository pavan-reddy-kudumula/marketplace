import { getUser } from '@/actions/user';
import SettingsClient from '@/components/SettingsClient';

export default async function SettingsPage() {
  const response = await getUser();

  if (response.error || !response.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-red-100 bg-white px-8 py-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Unable to load settings</h1>
          <p className="mt-3 text-sm text-gray-600">{response.error || 'Please sign in to continue.'}</p>
        </div>
      </div>
    );
  }

  return <SettingsClient user={response.data} />;
}
