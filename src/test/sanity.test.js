import { describe, it, expect } from 'vitest'

describe('Sanity Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have testing environment set up correctly', () => {
    expect(true).toBe(true)
  })
})
