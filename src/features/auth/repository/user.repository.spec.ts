import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/auth/schema/user.schema', () => ({
  UserModel: {
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

import { UserModel } from '@/features/auth/schema/user.schema';
import { mongo } from '@/shared/lib/mongo';

import { userRepository } from './user.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(UserModel);

const fakeUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: 'hash',
};

function makeLeanQuery<T>(result: T) {
  return { lean: () => ({ exec: () => Promise.resolve(result) }) };
}

describe('userRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findByEmail connects and calls findOne', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(fakeUser));
    const result = await userRepository.findByEmail('alice@example.com');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(result).toEqual(fakeUser);
  });

  it('findByEmail returns null when not found', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(null));
    const result = await userRepository.findByEmail('none@test.com');
    expect(result).toBeNull();
  });

  it('create calls model.create and returns id string', async () => {
    (mockModel.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ _id: { toString: () => '507f1f77bcf86cd799439011' } });
    const id = await userRepository.create({ name: 'Bob', email: 'bob@test.com', passwordHash: 'hash' });
    expect(id).toBe('507f1f77bcf86cd799439011');
  });
});
