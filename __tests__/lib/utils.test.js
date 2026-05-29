// Utility Functions Tests
// Tests for lib/utils.ts utility functions

import {
  capitalize,
  camelToTitle,
  truncate,
  slugify,
  isEmpty,
  formatDate,
  isToday,
  isFuture,
  cn,
} from '@/lib/utils'

describe('String Utilities', () => {
  describe('capitalize', () => {
    it('capitalizes the first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('camelToTitle', () => {
    it('converts camelCase to Title Case', () => {
      expect(camelToTitle('helloWorld')).toBe('Hello World')
    })

    it('handles single word', () => {
      expect(camelToTitle('hello')).toBe('Hello')
    })
  })

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 5)).toBe('He...')
    })

    it('returns original string if shorter than limit', () => {
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('uses custom suffix', () => {
      expect(truncate('Hello World', 5, '>>>')).toBe('He>>>')
    })
  })

  describe('slugify', () => {
    it('converts string to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(slugify('Test@#$%String')).toBe('test-string')
    })

    it('handles multiple spaces', () => {
      expect(slugify('test   string')).toBe('test-string')
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty string', () => {
      expect(isEmpty('')).toBe(true)
    })

    it('returns true for whitespace only', () => {
      expect(isEmpty('   ')).toBe(true)
    })

    it('returns true for null/undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('returns false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false)
    })
  })
})

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2024-06-01')
      expect(result).toContain('Jun')
      expect(result).toContain('1')
      expect(result).toContain('2024')
    })

    it('formats Date object correctly', () => {
      const date = new Date('2024-06-01')
      const result = formatDate(date)
      expect(result).toContain('Jun')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date())).toBe(true)
    })

    it('returns false for other dates', () => {
      expect(isToday('2024-01-01')).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('returns true for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      expect(isFuture(futureDate)).toBe(true)
    })

    it('returns false for past dates', () => {
      expect(isFuture('2020-01-01')).toBe(false)
    })
  })
})

describe('Array Utilities', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar')).toBe('foo')
    })
  })
})
