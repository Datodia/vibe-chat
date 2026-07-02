import { NextRequest, NextResponse } from 'next/server';

import {
  getConversationService,
  getGroupIfMemberService,
  getGroupMessagesService,
} from '@/features/chat/service/chat.service';
import { auth } from '@/shared/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const me = session?.user as { id?: string } | undefined;
    if (!me?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const groupId = req.nextUrl.searchParams.get('groupId');
    if (groupId) {
      const group = await getGroupIfMemberService(groupId, me.id);
      if (!group) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      const messages = await getGroupMessagesService(groupId);
      return NextResponse.json({ messages });
    }

    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });

    const messages = await getConversationService(me.id, userId);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
