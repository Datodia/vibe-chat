'use client';
import { SendHorizontal, UsersRound } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import type { ChatMessage } from '@/features/chat/types/chat.types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type ChatWindowProps = {
  myId: string;
  title: string | null;
  subtitle?: string;
  isGroup?: boolean;
  online?: boolean;
  messages: ChatMessage[];
  onSend: (text: string) => void;
};

export const ChatWindow = ({
  myId,
  title,
  subtitle,
  isGroup = false,
  online = false,
  messages,
  onSend,
}: ChatWindowProps) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!title) {
    return <section className="flex-1" aria-hidden="true" />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <section className="flex flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-5 py-3">
        {isGroup ? (
          <UsersRound className="size-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <span
            className={cn(
              'size-2 rounded-full',
              online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            )}
            aria-hidden="true"
          />
        )}
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hi 👋</p>
        ) : (
          messages.map((message) => {
            const mine = message.from === myId;
            return (
              <div
                key={message.id}
                className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
              >
                {isGroup && !mine && message.fromName && (
                  <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">
                    {message.fromName}
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                    mine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground'
                  )}
                >
                  {message.text}
                </div>
                <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${title}`}
          aria-label="Message"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send">
          <SendHorizontal className="size-4" />
        </Button>
      </form>
    </section>
  );
};
