'use client';
import { Users } from 'lucide-react';

import type { ChatContact } from '@/features/chat/types/chat.types';
import { cn } from '@/shared/lib/utils';

function initialsOf(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  );
}

type OnlineUsersProps = {
  users: ChatContact[];
  onlineCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export const OnlineUsers = ({ users, onlineCount, selectedId, onSelect }: OnlineUsersProps) => {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-border bg-sidebar sm:w-72">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Users className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Chats</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {onlineCount} online
        </span>
      </div>

      {users.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">No conversations yet.</p>
      ) : (
        <nav className="flex flex-col gap-1 overflow-y-auto p-2">
          {users.map((user) => {
            const isActive = user.id === selectedId;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => onSelect(user.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'relative inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                    'border border-border bg-muted text-xs font-semibold text-foreground',
                    !user.online && 'opacity-60'
                  )}
                >
                  {initialsOf(user.name)}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-sidebar',
                      user.online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                    )}
                    aria-label={user.online ? 'online' : 'offline'}
                  />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{user.name}</span>
                  {!user.online && (
                    <span className="text-xs font-normal text-muted-foreground">offline</span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </aside>
  );
};
