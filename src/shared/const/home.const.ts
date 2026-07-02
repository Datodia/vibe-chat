export type FeatureCard = {
  label: string;
  title: string;
  description: string;
  icon: 'layers' | 'shield' | 'boxes';
};

export const HOME_FEATURES: FeatureCard[] = [
  {
    label: 'Framework',
    title: 'Next.js 16',
    description:
      'App Router, React Server Components, and streaming built in. Ship fast on architecture that scales.',
    icon: 'layers',
  },
  {
    label: 'Auth & data',
    title: 'NextAuth + MongoDB',
    description:
      'Credentials and OAuth with JWT sessions, wired to MongoDB via Mongoose. Secure by default, extensible by design.',
    icon: 'shield',
  },
  {
    label: 'State & UI',
    title: 'Zustand + shadcn/ui',
    description:
      'Vanilla Zustand stores via context for predictable state. shadcn/ui for a polished, accessible interface.',
    icon: 'boxes',
  },
];

export type HomeStat = {
  value: string;
  label: string;
};

export const HOME_STATS: HomeStat[] = [
  { value: 'Day 1', label: 'Auth, DB & UI ready' },
  { value: '100%', label: 'TypeScript strict' },
  { value: 'Vitest', label: 'Tests wired in' },
];
