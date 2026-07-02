import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { Header } from '@/shared/components/layout/header';
import { auth } from '@/shared/lib/auth';
import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/sign-in');

  return (
    <SessionProvider>
      <StoreProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <Header />
          <main className="min-h-0 flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </StoreProvider>
    </SessionProvider>
  );
}
