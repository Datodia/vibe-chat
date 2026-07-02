import { NextResponse } from 'next/server';

import { userRepository } from '@/features/auth/repository/user.repository';
import { auth } from '@/shared/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const me = session?.user as { id?: string } | undefined;
    if (!me?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { items } = await userRepository.findAll(1, 1000);
    const users = items
      .map((u) => ({ id: u._id.toString(), name: u.name, avatar: u.avatar ?? null }))
      .filter((u) => u.id !== me.id);

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
