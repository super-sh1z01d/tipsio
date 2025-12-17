import { describe, it, expect } from 'vitest';
import { normalizeOcrResult } from '../../lib/menu-ai';

describe('normalizeOcrResult', () => {
  it('normalizes {text} into a single page', () => {
    const result = normalizeOcrResult({ text: 'Hello\nWorld' });
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageIndex).toBe(0);
    expect(result.pages[0].lines).toEqual(['Hello', 'World']);
  });

  it('normalizes {lines} into a single page', () => {
    const result = normalizeOcrResult({ lines: ['A', 'B'] });
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageIndex).toBe(0);
    expect(result.pages[0].lines).toEqual(['A', 'B']);
  });

  it('adds missing pageIndex for pages[] entries', () => {
    const result = normalizeOcrResult({ pages: [{ lines: ['Only line'] }] });
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageIndex).toBe(0);
    expect(result.pages[0].lines).toEqual(['Only line']);
  });

  it('supports pages as an object map', () => {
    const result = normalizeOcrResult({
      pages: {
        '0': ['a', 'b'],
        '1': 'c\nd',
      },
    });
    expect(result.pages).toHaveLength(2);
    expect(result.pages[0].pageIndex).toBe(0);
    expect(result.pages[0].lines).toEqual(['a', 'b']);
    expect(result.pages[1].pageIndex).toBe(1);
    expect(result.pages[1].lines).toEqual(['c', 'd']);
  });

  it('unwraps common wrapper keys', () => {
    const result = normalizeOcrResult({ result: { text: 'Wrapped' } });
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].lines).toEqual(['Wrapped']);
  });
});

