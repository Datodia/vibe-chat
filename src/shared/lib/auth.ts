import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { userRepository } from '@/features/auth/repository/user.repository';
import { upsertOAuthUserService } from '@/features/auth/service/auth.service';
import { hashPassword } from '@/shared/utils/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await userRepository.findByEmail(credentials.email as string);
        if (!user) return null;

        const passwordHash = hashPassword(credentials.password as string);
        if (user.passwordHash !== passwordHash) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email || !user.name) {
        return true;
      }

      await upsertOAuthUserService({
        email: user.email,
        name: user.name,
        avatar: user.image ?? null,
      });

      return true;
    },

    async jwt({ token, user }) {
      const authUser = user as ({ avatar?: string | null } & typeof user) | undefined;

      if (user) {
        token.id = authUser?.id ?? token.sub ?? '';
        token.email = user.email;
        token.name = user.name;
        token.avatar = authUser?.avatar ?? (token.avatar as string | null | undefined);
      }

      if (token.email) {
        const dbUser = await userRepository.findByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.avatar = dbUser.avatar ?? (token.avatar as string | null | undefined);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        const user = session.user as typeof session.user & {
          id: string;
          avatar?: string | null;
        };
        user.id = token.id as string;
        user.email = token.email as string;
        user.name = token.name as string;
        user.avatar = (token.avatar as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
