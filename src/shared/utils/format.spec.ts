import { describe, it, expect } from 'vitest';

import { formatDate, truncate, capitalize } from './format';

describe('formatDate', () => {
  it('formats a date object', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const result = formatDate(date, 'en-US');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });

  it('formats a date string', () => {
    const result = formatDate('2024-06-01', 'en-US');
    expect(result).toContain('2024');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    const result = truncate('Hello World', 5);
    expect(result).toBe('Hello...');
  });

  it('returns original if within limit', () => {
    const result = truncate('Hi', 10);
    expect(result).toBe('Hi');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('lowercases rest', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});
