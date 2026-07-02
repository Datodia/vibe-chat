import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { validateBody } from './validate-body';

const Schema = z.object({ name: z.string().min(1), age: z.number() });

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('validateBody', () => {
  it('returns parsed data for valid body', async () => {
    const result = await validateBody(makeRequest({ name: 'Alice', age: 30 }), Schema);
    expect(result).toEqual({ data: { name: 'Alice', age: 30 } });
  });

  it('returns 400 NextResponse for invalid body', async () => {
    const result = await validateBody(makeRequest({ name: '', age: 30 }), Schema);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.error).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing fields', async () => {
    const result = await validateBody(makeRequest({}), Schema);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for non-JSON body', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await validateBody(req, Schema);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
