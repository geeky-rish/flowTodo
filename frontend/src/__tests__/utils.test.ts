import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, cn } from '@/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats ISO date string to readable format', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
    })

    it('returns Today for today date', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(formatDate(today)).toBe('Today')
    })

    it('returns original string for invalid date', () => {
      expect(formatDate('invalid')).toBe('invalid')
    })

    it('returns empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('formatTime', () => {
    it('formats HH:MM to 12-hour format with AM/PM', () => {
      expect(formatTime('14:30')).toBe('2:30 PM')
      expect(formatTime('09:00')).toBe('9:00 AM')
      expect(formatTime('00:00')).toBe('12:00 AM')
      expect(formatTime('12:00')).toBe('12:00 PM')
    })

    it('returns empty string for invalid input', () => {
      expect(formatTime('')).toBe('')
      expect(formatTime(undefined)).toBe('')
    })
  })

  describe('cn (classnames)', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
    })

    it('handles empty args', () => {
      expect(cn()).toBe('')
    })
  })
})