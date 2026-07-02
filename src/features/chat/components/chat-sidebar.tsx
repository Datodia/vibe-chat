'use client';
import { Plus, Users, UsersRound } from 'lucide-react';

import type { SidebarContact, SidebarGroup } from '@/features/chat/hooks/chat-selectors';
import { Button } from '@/shared/components/ui/button';
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

const UnreadBadge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span
      className={cn(
        'ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary',
        'px-1.5 py-0.5 text-xs font-semibold text-primary-foreground'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

type SelectedKind = { type: 'direct' | 'group'; id: string } | null;

type ChatSidebarProps = {
  users: SidebarContact[];
  groups: SidebarGroup[];
  onlineCount: number;
  selected: SelectedKind;
  onSelectDirect: (id: string) => void;
  onSelectGroup: (id: string) => void;
  onNewGroup: () => void;
};

export const ChatSidebar = ({
  users,
  groups,
  onlineCount,
  selected,
  onSelectDirect,
  onSelectGroup,
  onNewGroup,
}: ChatSidebarProps) => {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-border bg-sidebar sm:w-72">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Users className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Chats</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {onlineCount} online
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {/* Groups */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Groups
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={onNewGroup}
            aria-label="New group"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {groups.length === 0 ? (
          <p className="px-2 pb-1 text-xs text-muted-foreground">No groups yet.</p>
        ) : (
          <nav className="flex flex-col gap-1">
            {groups.map((group) => {
              const isActive = selected?.type === 'group' && selected.id === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => onSelectGroup(group.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                    <UsersRound className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{group.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {group.members.length} members
                    </span>
                  </span>
                  <UnreadBadge count={group.unread} />
                </button>
              );
            })}
          </nav>
        )}

        {/* People */}
        <div className="px-2 pt-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            People
          </span>
        </div>

        {users.length === 0 ? (
          <p className="px-2 pb-1 text-xs text-muted-foreground">No conversations yet.</p>
        ) : (
          <nav className="flex flex-col gap-1">
            {users.map((user) => {
              const isActive = selected?.type === 'direct' && selected.id === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelectDirect(user.id)}
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
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{user.name}</span>
                    {!user.online && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        offline
                      </span>
                    )}
                  </span>
                  <UnreadBadge count={user.unread} />
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
};
