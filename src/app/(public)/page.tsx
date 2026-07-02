import { redirect } from 'next/navigation';

import { AuthModal } from '@/features/auth/components/auth-modal';
import { auth } from '@/shared/lib/auth';

export default async function HomePage() {
  const session = await auth();
  if (session) redirect('/chat');

  return <AuthModal />;
}
