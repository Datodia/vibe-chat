import { describe, it, expect } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('resolves tailwind conflicts — last wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles undefined gracefully', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('handles array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});
