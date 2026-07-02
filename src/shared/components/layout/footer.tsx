import { APP_NAME } from '@/shared/const/app.const';

export const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-6 sm:px-10">
      <p className="text-center text-xs text-muted-foreground">
        {APP_NAME} ships with Next.js 16, NextAuth v5, Mongoose, Zustand, and shadcn/ui.
      </p>
    </footer>
  );
};
