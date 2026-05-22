import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercent, capitalize } from '../utils/format';

describe('formatCurrency', () => {
  it('formats BRL correctly', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formats USD', () => {
    const result = formatCurrency(99.99, 'USD', 'en-US');
    expect(result).toContain('99.99');
  });
});

describe('formatPercent', () => {
  it('rounds to integer', () => {
    expect(formatPercent(75.4)).toBe('75%');
    expect(formatPercent(100)).toBe('100%');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-03-15T00:00:00Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('returns dash for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('-');
  });
});
