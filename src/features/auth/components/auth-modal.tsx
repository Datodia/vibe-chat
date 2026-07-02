'use client';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

import { LoginForm } from '@/features/auth/components/login-form';
import { SignUpForm } from '@/features/auth/components/signup-form';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { APP_NAME } from '@/shared/const/app.const';
import { cn } from '@/shared/lib/utils';

type Tab = 'signin' | 'signup';

const TABS: { key: Tab; label: string }[] = [
  { key: 'signin', label: 'Sign in' },
  { key: 'signup', label: 'Sign up' },
];

export const AuthModal = () => {
  const [tab, setTab] = useState<Tab>('signin');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-b from-muted/40 to-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
            <MessageCircle className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in or create an account to start chatting.
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Authentication"
          className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1"
        >
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {tab === 'signin' ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
};
