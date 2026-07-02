import { type ReactNode } from 'react';

import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </StoreProvider>
    </SessionProvider>
  );
}
