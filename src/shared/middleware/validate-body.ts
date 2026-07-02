import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | NextResponse> {
  const body = await req.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    );
  }
  return { data: result.data };
}
