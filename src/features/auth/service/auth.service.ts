import { userRepository } from '@/features/auth/repository/user.repository';
import { User } from '@/features/auth/types/auth.types';
import { LoginType, SignUpType } from '@/features/auth/validations/auth.validation';
import { ServiceResult } from '@/shared/types/common';
import { hashPassword } from '@/shared/utils/password';

export async function registerService(
  input: SignUpType
): Promise<ServiceResult<{ message: string }>> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) return { data: { error: 'EMAIL_TAKEN' }, status: 409 };

  await userRepository.create({
    name: input.fullName,
    email: input.email,
    passwordHash: hashPassword(input.password),
  });

  return { data: { message: 'Account created' }, status: 201 };
}

export async function loginService(input: LoginType): Promise<ServiceResult<User>> {
  const user = await userRepository.findByEmail(input.email);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const passwordHash = hashPassword(input.password);
  if (user.passwordHash !== passwordHash) {
    return { data: { error: 'INVALID_CREDENTIALS' }, status: 401 };
  }

  return {
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? undefined,
    },
    status: 200,
  };
}

export async function getUserByIdService(id: string): Promise<ServiceResult<User>> {
  const user = await userRepository.findById(id);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return {
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? undefined,
    },
    status: 200,
  };
}

export async function upsertOAuthUserService(data: {
  email: string;
  name: string;
  avatar: string | null;
}): Promise<{ isNew: boolean }> {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    await userRepository.updateByEmail(data.email, {
      name: data.name,
      avatar: data.avatar ?? undefined,
    });
    return { isNew: false };
  }
  await userRepository.create({
    name: data.name,
    email: data.email,
    passwordHash: '',
    avatar: data.avatar ?? undefined,
  });
  return { isNew: true };
}
