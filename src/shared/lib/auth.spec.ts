import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the config passed to NextAuth so we can test callbacks directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedConfig: Record<string, any> = {};

vi.mock('next-auth', () => ({
  default: vi.fn((config) => {
    capturedConfig = config;
    return {
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  }),
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => ({ id: 'credentials', ...config })),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((config) => ({ id: 'google', ...config })),
}));

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
  },
}));

vi.mock('@/features/auth/service/auth.service', () => ({
  upsertOAuthUserService: vi.fn(),
}));

// Import after mocks so NextAuth() is called with mocked providers
await import('@/shared/lib/auth');
const { userRepository } = await import('@/features/auth/repository/user.repository');
const { upsertOAuthUserService } = await import('@/features/auth/service/auth.service');
const mockRepo = vi.mocked(userRepository);
const mockUpsert = vi.mocked(upsertOAuthUserService);

const fakeUser = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  name: 'Alice',
  email: 'alice@example.com',
  // sha256('123456') — matches value used in auth.service.spec.ts
  passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  avatar: 'https://example.com/avatar.png',
};

describe('auth callbacks — signIn', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true for non-Google providers without DB call', async () => {
    const result = await capturedConfig.callbacks.signIn({
      user: { email: 'a@b.com', name: 'A' },
      account: { provider: 'credentials' },
    });
    expect(result).toBe(true);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('upserts Google user and returns true', async () => {
    mockUpsert.mockResolvedValueOnce({ isNew: false });
    const result = await capturedConfig.callbacks.signIn({
      user: { email: 'g@gmail.com', name: 'Google User', image: 'https://img.com/avatar.png' },
      account: { provider: 'google' },
    });
    expect(result).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith({
      email: 'g@gmail.com',
      name: 'Google User',
      avatar: 'https://img.com/avatar.png',
    });
  });

  it('returns true for Google even when image is null', async () => {
    mockUpsert.mockResolvedValueOnce({ isNew: true });
    const result = await capturedConfig.callbacks.signIn({
      user: { email: 'g@gmail.com', name: 'Google User', image: null },
      account: { provider: 'google' },
    });
    expect(result).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ avatar: null }));
  });
});

describe('auth callbacks — jwt', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enriches token with DB user data on every call', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const token = await capturedConfig.callbacks.jwt({
      token: { email: 'alice@example.com' },
      user: undefined,
    });
    expect(token.id).toBe('507f1f77bcf86cd799439011');
    expect(token.avatar).toBe('https://example.com/avatar.png');
  });

  it('keeps token id when DB user not found', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    const token = await capturedConfig.callbacks.jwt({
      token: { email: 'nobody@example.com', id: 'existing-id' },
      user: undefined,
    });
    expect(token.id).toBe('existing-id');
  });

  it('sets token fields from user on initial sign-in', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const token = await capturedConfig.callbacks.jwt({
      token: { email: 'alice@example.com' },
      user: { id: 'initial-id', email: 'alice@example.com', name: 'Alice', avatar: null },
    });
    expect(token.name).toBe('Alice');
    expect(token.email).toBe('alice@example.com');
  });
});

describe('auth callbacks — session', () => {
  it('maps token fields onto session.user', async () => {
    const session = {
      user: { name: 'Alice', email: 'alice@example.com' },
      expires: '2099-01-01',
    };
    const token = {
      id: '507f1f77bcf86cd799439011',
      email: 'alice@example.com',
      name: 'Alice',
      avatar: 'https://example.com/avatar.png',
    };
    const result = await capturedConfig.callbacks.session({ session, token });
    expect(result.user.id).toBe('507f1f77bcf86cd799439011');
    expect(result.user.avatar).toBe('https://example.com/avatar.png');
  });

  it('sets avatar to null when token avatar is undefined', async () => {
    const session = { user: {}, expires: '2099-01-01' };
    const token = { id: 'x', email: 'a@b.com', name: 'A' };
    const result = await capturedConfig.callbacks.session({ session, token });
    expect(result.user.avatar).toBeNull();
  });
});

describe('auth credentials — authorize', () => {
  beforeEach(() => vi.clearAllMocks());

  const credentialsProvider = capturedConfig.providers?.find(
    (p: { id: string }) => p.id === 'credentials'
  );

  it('returns null when credentials missing', async () => {
    const result = await credentialsProvider?.authorize({});
    expect(result).toBeNull();
  });

  it('returns null when user not found', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    const result = await credentialsProvider?.authorize({
      email: 'nobody@example.com',
      password: 'password123',
    });
    expect(result).toBeNull();
  });

  it('returns null on wrong password', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await credentialsProvider?.authorize({
      email: 'alice@example.com',
      password: 'wrongpassword',
    });
    expect(result).toBeNull();
  });

  it('returns user object on valid credentials', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await credentialsProvider?.authorize({
      email: 'alice@example.com',
      password: '123456',
    });
    expect(result).toMatchObject({
      id: '507f1f77bcf86cd799439011',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });
});
