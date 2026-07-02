'use client';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

import type { OnlineUser } from '@/features/chat/types/chat.types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

type NewGroupDialogProps = {
  users: OnlineUser[];
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => void;
};

// Mounted only while open (see ChatApp), so state resets naturally each time.
export const NewGroupDialog = ({ users, onClose, onCreate }: NewGroupDialogProps) => {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canCreate = name.trim().length > 0 && selected.size > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate(name, [...selected]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex w-full max-w-md flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold">New group</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="group-name" className="text-sm font-medium">
              Group name
            </label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend plans"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Members{selected.size > 0 ? ` (${selected.size})` : ''}
            </span>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other users to add yet.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                {users.map((user) => {
                  const checked = selected.has(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggle(user.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <span
                        className={cn(
                          'inline-flex size-5 shrink-0 items-center justify-center rounded border',
                          checked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        )}
                      >
                        {checked && <Check className="size-3.5" />}
                      </span>
                      <span className="truncate">{user.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            Create group
          </Button>
        </div>
      </div>
    </div>
  );
};
