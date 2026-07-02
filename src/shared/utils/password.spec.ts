import { describe, expect, it } from 'vitest';

import { hashPassword } from '@/shared/utils/password';

describe('hashPassword', () => {
  it('returns the expected SHA-256 hash', () => {
    expect(hashPassword('password123')).toBe(
      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
    );
  });
});
