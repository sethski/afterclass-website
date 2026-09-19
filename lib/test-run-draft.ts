import { isCompleteSlot, type ScheduleSlot } from '@/lib/test-run-schedule'
import { testRunContent } from '@/lib/test-run-content'
import {
  emptyTestRunState,
  type TestRunFormState,
} from '@/lib/validations/test-run'
import {
  getActiveSteps,
  isTestRunEnding,
  type TestRunScreen,
  type TestRunStepId,
} from '@/lib/test-run-steps'

export const TEST_RUN_DRAFT_KEY = 'afterclass:testrun-draft:v1'
const DRAFT_VERSION = 1
const FILE_DB = 'afterclass-testrun-draft'
const FILE_STORE = 'files'

type DraftPayload = {
  v: number
  screen: string
  values: Record<string, unknown>
}

type DraftFileKey = 'facePhoto' | 'schoolIdPhoto'

type StoredFile = {
  name: string
  type: string
  lastModified: number
  buffer: ArrayBuffer
}

export type TestRunDraft = {
  screen: TestRunScreen
  values: TestRunFormState
}

function defaultStorage(): Storage | null {
  try {
    if (typeof sessionStorage === 'undefined') return null
    return sessionStorage
  } catch {
    return null
  }
}

export function coerceScreen(
  screen: string,
  values: TestRunFormState
): TestRunScreen {
  if (screen === 'welcome') return 'welcome'
  if (isTestRunEnding(screen)) return screen
  const steps = getActiveSteps(values)
  if (steps.includes(screen as TestRunStepId)) return screen as TestRunStepId
  return steps[0] ?? 'welcome'
}

export function restoreScreen(
  screen: string,
  values: TestRunFormState
): TestRunScreen {
  const current = coerceScreen(screen, values)
  if (current === 'welcome' || isTestRunEnding(current)) return current
  const steps = getActiveSteps(values)
  const faceIdx = steps.indexOf('facePhoto')
  const curIdx = steps.indexOf(current)
  if (faceIdx >= 0 && curIdx > faceIdx && !values.facePhoto) {
    return 'facePhoto'
  }
  return current
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  if (!value.every((item) => typeof item === 'string')) return null
  return value
}

function mergeDraftValues(
  base: TestRunFormState,
  incoming: Record<string, unknown>
): TestRunFormState {
  const next: TestRunFormState = { ...base, facePhoto: null, schoolIdPhoto: null }

  const strings = [
    'campus',
    'cityCorridor',
    'cityCorridorOther',
    'fullName',
    'age',
    'email',
    'phone',
    'socials',
    'genderOther',
    'meetOther',
    'school',
    'yearLevel',
    'yearLevelOther',
    'departureArea',
    'maxTravel',
    'aboutYou',
    'preferredCafes',
    'refuseAreas',
    'accessibility',
    'hardNos',
    'emergencyName',
    'emergencyPhone',
    'howHeard',
    'prefillEmail',
  ] as const
  for (const key of strings) {
    if (typeof incoming[key] === 'string') {
      next[key] = incoming[key]
    }
  }

  const bools = [
    'consent',
    'isMe',
    'understandEarly',
    'publicCafe',
    'canReport',
    'understandData',
    'everythingTrue',
  ] as const
  for (const key of bools) {
    if (typeof incoming[key] === 'boolean') {
      next[key] = incoming[key]
    }
  }

  if (incoming.wantIn === 'yes' || incoming.wantIn === 'no' || incoming.wantIn === '') {
    next.wantIn = incoming.wantIn
  }
  if (
    incoming.coverOwnOrder === 'yes' ||
    incoming.coverOwnOrder === 'no' ||
    incoming.coverOwnOrder === ''
  ) {
    next.coverOwnOrder = incoming.coverOwnOrder
  }
  if (
    incoming.nearbySchoolOk === 'yes' ||
    incoming.nearbySchoolOk === 'no' ||
    incoming.nearbySchoolOk === ''
  ) {
    next.nearbySchoolOk = incoming.nearbySchoolOk
  }
  if (
    incoming.cancelEarly === 'yes' ||
    incoming.cancelEarly === 'no' ||
    incoming.cancelEarly === ''
  ) {
    next.cancelEarly = incoming.cancelEarly
  }
  if (
    incoming.contactPreference === '' ||
    (typeof incoming.contactPreference === 'string' &&
      (testRunContent.contactOptions as readonly string[]).includes(
        incoming.contactPreference
      ))
  ) {
    next.contactPreference = incoming.contactPreference as TestRunFormState['contactPreference']
  }
  if (
    incoming.gender === '' ||
    (typeof incoming.gender === 'string' &&
      (testRunContent.genderOptions as readonly string[]).includes(incoming.gender))
  ) {
    next.gender = incoming.gender as TestRunFormState['gender']
  }
  if (incoming.interviewOk === true || incoming.interviewOk === false || incoming.interviewOk === null) {
    next.interviewOk = incoming.interviewOk
  }

  const meet = asStringArray(incoming.meetGenders)
  if (meet) {
    next.meetGenders = meet.filter((item) =>
      (testRunContent.meetOptions as readonly string[]).includes(item)
    ) as TestRunFormState['meetGenders']
  }

  const deals = asStringArray(incoming.dealbreakers)
  if (deals && deals.length > 0) next.dealbreakers = deals

  if (Array.isArray(incoming.scheduleSlots)) {
    next.scheduleSlots = incoming.scheduleSlots.filter((item): item is ScheduleSlot =>
      isCompleteSlot(item as ScheduleSlot)
    )
  }

  return next
}

export function parseTestRunDraft(
  raw: string,
  prefill?: { email?: string; howHeard?: string }
): TestRunDraft | null {
  try {
    const data = JSON.parse(raw) as DraftPayload
    if (data?.v !== DRAFT_VERSION || typeof data.screen !== 'string') return null
    if (!data.values || typeof data.values !== 'object' || Array.isArray(data.values)) {
      return null
    }
    const values = mergeDraftValues(emptyTestRunState(prefill), data.values)
    if (!values.email && prefill?.email) values.email = prefill.email.trim()
    if (!values.howHeard && prefill?.howHeard) values.howHeard = prefill.howHeard.trim()
    return {
      screen: coerceScreen(data.screen, values),
      values,
    }
  } catch {
    return null
  }
}

export function serializeTestRunDraft(screen: TestRunScreen, values: TestRunFormState): string {
  const { facePhoto: _face, schoolIdPhoto: _id, ...rest } = values
  const payload: DraftPayload = {
    v: DRAFT_VERSION,
    screen,
    values: rest,
  }
  return JSON.stringify(payload)
}

export function readTestRunDraft(
  prefill?: { email?: string; howHeard?: string },
  storage: Storage | null = defaultStorage()
): TestRunDraft | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(TEST_RUN_DRAFT_KEY)
    if (!raw) return null
    return parseTestRunDraft(raw, prefill)
  } catch {
    return null
  }
}

export function writeTestRunDraft(
  screen: TestRunScreen,
  values: TestRunFormState,
  storage: Storage | null = defaultStorage()
): void {
  if (!storage) return
  try {
    storage.setItem(TEST_RUN_DRAFT_KEY, serializeTestRunDraft(screen, values))
  } catch {
    // Quota or private mode — keep the in-memory form going.
  }
}

export function clearTestRunDraft(storage: Storage | null = defaultStorage()): void {
  if (!storage) return
  try {
    storage.removeItem(TEST_RUN_DRAFT_KEY)
  } catch {
    // ignore
  }
}

function openFileDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(FILE_DB, 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          db.createObjectStore(FILE_STORE)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function idbReq<T>(req: IDBRequest<T>): Promise<T | null> {
  return new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

async function fileToStored(file: File | null): Promise<StoredFile | null> {
  if (!file) return null
  return {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    buffer: await file.arrayBuffer(),
  }
}

function storedToFile(record: StoredFile | null): File | null {
  if (!record?.buffer) return null
  return new File([record.buffer], record.name || 'photo', {
    type: record.type || 'application/octet-stream',
    lastModified: record.lastModified || Date.now(),
  })
}

export async function readTestRunDraftFiles(): Promise<{
  facePhoto: File | null
  schoolIdPhoto: File | null
}> {
  const empty = { facePhoto: null, schoolIdPhoto: null }
  const db = await openFileDb()
  if (!db) return empty
  try {
    const tx = db.transaction(FILE_STORE, 'readonly')
    const store = tx.objectStore(FILE_STORE)
    const face = storedToFile(await idbReq<StoredFile | null>(store.get('facePhoto')))
    const schoolId = storedToFile(
      await idbReq<StoredFile | null>(store.get('schoolIdPhoto'))
    )
    db.close()
    return { facePhoto: face, schoolIdPhoto: schoolId }
  } catch {
    db.close()
    return empty
  }
}

export async function writeTestRunDraftFiles(
  facePhoto: File | null,
  schoolIdPhoto: File | null
): Promise<void> {
  const records: Record<DraftFileKey, StoredFile | null> = {
    facePhoto: await fileToStored(facePhoto),
    schoolIdPhoto: await fileToStored(schoolIdPhoto),
  }
  const db = await openFileDb()
  if (!db) return
  try {
    const tx = db.transaction(FILE_STORE, 'readwrite')
    const store = tx.objectStore(FILE_STORE)
    for (const key of ['facePhoto', 'schoolIdPhoto'] as const) {
      if (records[key]) store.put(records[key], key)
      else store.delete(key)
    }
    db.close()
  } catch {
    db.close()
  }
}

export async function clearTestRunDraftFiles(): Promise<void> {
  const db = await openFileDb()
  if (!db) return
  try {
    const tx = db.transaction(FILE_STORE, 'readwrite')
    tx.objectStore(FILE_STORE).clear()
    db.close()
  } catch {
    db.close()
  }
}
