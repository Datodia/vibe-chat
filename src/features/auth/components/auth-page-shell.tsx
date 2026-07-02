import { type ReactNode } from 'react';

import { Header } from '@/shared/components/layout/header';

type AuthPageShellProps = {
  children: ReactNode;
};

export const AuthPageShell = ({ children }: AuthPageShellProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
};
