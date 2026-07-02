import { NextRequest, NextResponse } from 'next/server';

import { getConversationService } from '@/features/chat/service/chat.service';
import { ConversationQuerySchema } from '@/features/chat/validations/chat.validation';
import { auth } from '@/shared/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const me = session?.user as { id?: string } | undefined;
    if (!me?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const parsed = ConversationQuerySchema.safeParse({
      userId: req.nextUrl.searchParams.get('userId') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const messages = await getConversationService(me.id, parsed.data.userId);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
