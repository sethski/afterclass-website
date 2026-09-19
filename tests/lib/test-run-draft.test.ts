import { describe, expect, it } from 'vitest'
import { emptyTestRunState } from '@/lib/validations/test-run'
import {
  coerceScreen,
  parseTestRunDraft,
  restoreScreen,
  serializeTestRunDraft,
  writeTestRunDraft,
  readTestRunDraft,
  TEST_RUN_DRAFT_KEY,
} from '@/lib/test-run-draft'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key) {
      return map.get(key) ?? null
    },
    setItem(key, value) {
      map.set(key, String(value))
    },
    removeItem(key) {
      map.delete(key)
    },
    key(index) {
      return [...map.keys()][index] ?? null
    },
  }
}

describe('test-run-draft', () => {
  it('round-trips answers and the current step', () => {
    const values = emptyTestRunState()
    values.fullName = 'Ada Reyes'
    values.email = 'ada@upd.edu.ph'
    values.age = '20'
    const raw = serializeTestRunDraft('email', values)
    const parsed = parseTestRunDraft(raw)
    expect(parsed?.screen).toBe('email')
    expect(parsed?.values.fullName).toBe('Ada Reyes')
    expect(parsed?.values.email).toBe('ada@upd.edu.ph')
    expect(parsed?.values.facePhoto).toBeNull()
  })

  it('does not keep File objects in JSON', () => {
    const values = emptyTestRunState()
    values.facePhoto = new File(['x'], 'selfie.jpg', { type: 'image/jpeg' })
    const parsed = parseTestRunDraft(serializeTestRunDraft('facePhoto', values))
    expect(parsed?.values.facePhoto).toBeNull()
    expect(JSON.parse(serializeTestRunDraft('facePhoto', values)).values.facePhoto).toBeUndefined()
  })

  it('rejects junk JSON', () => {
    expect(parseTestRunDraft('')).toBeNull()
    expect(parseTestRunDraft('{')).toBeNull()
    expect(parseTestRunDraft('{"v":2,"screen":"email","values":{}}')).toBeNull()
  })

  it('snaps unknown steps to the first live step', () => {
    const values = emptyTestRunState()
    expect(coerceScreen('phone', values)).toBe('intro')
    expect(coerceScreen('cityCorridorOther', values)).toBe('intro')
    values.cityCorridor = 'Other'
    expect(coerceScreen('cityCorridorOther', values)).toBe('cityCorridorOther')
  })

  it('returns to the photo step if later answers exist but the photo does not', () => {
    const values = emptyTestRunState()
    values.fullName = 'Ada Reyes'
    expect(restoreScreen('schedule', values)).toBe('facePhoto')
    values.facePhoto = new File(['x'], 'selfie.jpg', { type: 'image/jpeg' })
    expect(restoreScreen('schedule', values)).toBe('schedule')
  })

  it('keeps ending screens', () => {
    expect(restoreScreen('ending-ok', emptyTestRunState())).toBe('ending-ok')
  })

  it('writes and reads from the given storage', () => {
    const storage = memoryStorage()
    const values = emptyTestRunState()
    values.socials = '@ada'
    writeTestRunDraft('socials', values, storage)
    expect(storage.getItem(TEST_RUN_DRAFT_KEY)).toBeTruthy()
    const draft = readTestRunDraft(undefined, storage)
    expect(draft?.screen).toBe('socials')
    expect(draft?.values.socials).toBe('@ada')
  })
})
