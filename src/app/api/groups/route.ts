import { NextResponse } from 'next/server';

import { getGroupsService } from '@/features/chat/service/chat.service';
import { auth } from '@/shared/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const me = session?.user as { id?: string } | undefined;
    if (!me?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const groups = await getGroupsService(me.id);
    return NextResponse.json({ groups });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
