import { NextResponse } from 'next/server';

import { getContactsService } from '@/features/chat/service/chat.service';
import { auth } from '@/shared/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const me = session?.user as { id?: string } | undefined;
    if (!me?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const contacts = await getContactsService(me.id);
    return NextResponse.json({ contacts });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
