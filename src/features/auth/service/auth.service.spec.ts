import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

import { userRepository } from '@/features/auth/repository/user.repository';

import { loginService, registerService, getUserByIdService } from './auth.service';

const mockRepo = vi.mocked(userRepository);

const fakeUser = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  avatar: undefined,
};

describe('registerService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 409 when email already taken', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await registerService({ fullName: 'Alice', email: 'alice@example.com', password: 'password123' });
    expect(result.status).toBe(409);
    expect(result.data).toEqual({ error: 'EMAIL_TAKEN' });
  });

  it('returns 201 on successful registration', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    const result = await registerService({ fullName: 'Bob', email: 'bob@example.com', password: 'password123' });
    expect(result.status).toBe(201);
    expect(result.data).toEqual({ message: 'Account created' });
  });

  it('creates user with hashed password', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    await registerService({ fullName: 'Bob', email: 'bob@example.com', password: 'password123' });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bob', email: 'bob@example.com' })
    );
  });
});

describe('loginService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when user not found', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    const result = await loginService({ email: 'nobody@test.com', password: 'password123' });
    expect(result.status).toBe(404);
  });

  it('returns 401 when password is wrong', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await loginService({ email: 'alice@example.com', password: 'wrongpass' });
    expect(result.status).toBe(401);
    expect(result.data).toEqual({ error: 'INVALID_CREDENTIALS' });
  });

  it('returns 200 with user data on valid credentials', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await loginService({ email: 'alice@example.com', password: '123456' });
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ email: 'alice@example.com', name: 'Alice' });
  });
});

describe('getUserByIdService', () => {
  it('returns 404 when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const result = await getUserByIdService('nonexistent');
    expect(result.status).toBe(404);
  });

  it('returns 200 with user data', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeUser as never);
    const result = await getUserByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
  });
});
