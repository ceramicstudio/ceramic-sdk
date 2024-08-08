import { CeramicClient } from '@ceramic-sdk/http-client'
import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// SyncStorage type from jotail/utils, not publicly exported
type SyncStorage<Value> = {
  getItem: (key: string, initialValue: Value) => Value
  setItem: (key: string, newValue: Value) => void
  removeItem: (key: string) => void
}

const booleanStorage: SyncStorage<boolean> = {
  getItem: (key, initialValue) => {
    const value = localStorage.getItem(key)
    return value ? value === '1' : initialValue
  },
  setItem: (key, value) => {
    localStorage.setItem(key, value === true ? '1' : '0')
  },
  removeItem: (key) => localStorage.removeItem(key),
}

const optionalStringStorage: SyncStorage<string | undefined> = {
  getItem: (key, initialValue) => localStorage.getItem(key) ?? initialValue,
  setItem: (key, value) => {
    if (value == null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key) => localStorage.removeItem(key),
}

export const store = createStore()

export const ceramicURLAtom = atom('http://localhost:5101')

export const ceramicClientAtom = atom((get) => {
  const url = get(ceramicURLAtom)
  return new CeramicClient({ url })
})

export function getCeramicClient(): CeramicClient {
  return store.get(ceramicClientAtom)
}

export const feedSyncEnabledAtom = atomWithStorage(
  'explorer.feed.syncEnabled',
  true,
  booleanStorage,
  { getOnInit: true },
)

export const feedResumeTokenAtom = atomWithStorage(
  'explorer.feed.resumeToken',
  undefined,
  optionalStringStorage,
  { getOnInit: true },
)
