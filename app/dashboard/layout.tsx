import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeToken } from '@/lib/auth-tokens';
import Sidebar from '@/app/components/navigation/Sidebar';
import TopNav from '@/app/components/navigation/TopNav';

const ACCESS_COOKIE = 'dashboard.access_token';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;

  if (!payload || Date.now() > payload.exp) {
    redirect('/login?reason=unauthenticated');
  }

  return (
    <div className="flex h-full min-h-screen bg-page-bg">
      <Sidebar userName={payload.name} userEmail="" />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav userName={payload.name} notificationCount={9} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
