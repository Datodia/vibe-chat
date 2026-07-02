'use client';
import { ChatWindow } from '@/features/chat/components/chat-window';
import { OnlineUsers } from '@/features/chat/components/online-users';
import { useChat } from '@/features/chat/hooks/use-chat';
import { cn } from '@/shared/lib/utils';

export const ChatApp = () => {
  const {
    myId,
    connected,
    users,
    onlineCount,
    selectedId,
    selectedUser,
    isSelectedOnline,
    messages,
    selectUser,
    sendMessage,
  } = useChat();

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
        <div className={cn('flex sm:flex', selectedId ? 'hidden sm:flex' : 'flex w-full')}>
          <OnlineUsers
            users={users}
            onlineCount={onlineCount}
            selectedId={selectedId}
            onSelect={selectUser}
          />
        </div>
        <div className={cn('flex-1', selectedId ? 'flex' : 'hidden sm:flex')}>
          <ChatWindow
            myId={myId}
            peer={selectedUser}
            isPeerOnline={isSelectedOnline}
            messages={messages}
            onSend={sendMessage}
          />
        </div>
      </div>
    </div>
  );
};
