import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/auth/service/auth.service', () => ({
  registerService: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { registerService } from '@/features/auth/service/auth.service';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockRegister = vi.mocked(registerService);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 on success', async () => {
    mockValidate.mockResolvedValueOnce({ data: { fullName: 'Bob', email: 'b@b.com', password: 'pass1234' } } as never);
    mockRegister.mockResolvedValueOnce({ data: { message: 'Account created' }, status: 201 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);
  });

  it('returns 409 when email is taken', async () => {
    mockValidate.mockResolvedValueOnce({ data: { fullName: 'Bob', email: 'b@b.com', password: 'pass1234' } } as never);
    mockRegister.mockResolvedValueOnce({ data: { error: 'EMAIL_TAKEN' }, status: 409 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(409);
  });

  it('returns validation error when body is invalid', async () => {
    mockValidate.mockResolvedValueOnce(
      NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
    );
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 500 when service throws', async () => {
    mockValidate.mockResolvedValueOnce({ data: {} } as never);
    mockRegister.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
