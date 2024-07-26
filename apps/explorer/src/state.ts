import { CeramicClient } from '@ceramic-sdk/http-client'
import { atom } from 'jotai'

export const ceramicURLAtom = atom('http://localhost:5101')

export const ceramicClientAtom = atom((get) => {
  const url = get(ceramicURLAtom)
  return new CeramicClient({ url })
})
