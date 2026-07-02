'use client';
import { useState } from 'react';

import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { ChatWindow } from '@/features/chat/components/chat-window';
import { NewGroupDialog } from '@/features/chat/components/new-group-dialog';
import { useChat } from '@/features/chat/hooks/use-chat';
import { cn } from '@/shared/lib/utils';

export const ChatApp = () => {
  const {
    myId,
    connected,
    users,
    groups,
    allUsers,
    onlineCount,
    selected,
    selectedGroup,
    selectedDirectUser,
    isSelectedOnline,
    messages,
    selectDirect,
    selectGroup,
    sendMessage,
    createGroup,
  } = useChat();

  const [dialogOpen, setDialogOpen] = useState(false);

  const isGroup = selected?.type === 'group';
  const title = isGroup ? selectedGroup?.name ?? null : selectedDirectUser?.name ?? null;
  const subtitle = isGroup
    ? selectedGroup
      ? `${selectedGroup.members.length} members`
      : undefined
    : selected
      ? isSelectedOnline
        ? 'online'
        : 'offline'
      : undefined;

  return (
    <div
      className={cn(
        'mx-auto flex h-full w-full max-w-6xl flex-col',
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm'
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Messages
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn('size-2 rounded-full', connected ? 'bg-emerald-500' : 'bg-amber-500')}
            aria-hidden="true"
          />
          {connected ? 'Connected' : 'Connecting…'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Hide the list on mobile once a chat is open. */}
        <div className={cn('flex sm:flex', selected ? 'hidden sm:flex' : 'flex w-full')}>
          <ChatSidebar
            users={users}
            groups={groups}
            onlineCount={onlineCount}
            selected={selected}
            onSelectDirect={selectDirect}
            onSelectGroup={selectGroup}
            onNewGroup={() => setDialogOpen(true)}
          />
        </div>
        <div className={cn('flex-1', selected ? 'flex' : 'hidden sm:flex')}>
          <ChatWindow
            myId={myId}
            title={title}
            subtitle={subtitle}
            isGroup={isGroup}
            online={isSelectedOnline}
            messages={messages}
            onSend={sendMessage}
          />
        </div>
      </div>

      {dialogOpen && (
        <NewGroupDialog
          users={allUsers}
          onClose={() => setDialogOpen(false)}
          onCreate={createGroup}
        />
      )}
    </div>
  );
};
