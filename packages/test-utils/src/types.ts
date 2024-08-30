import type { Cacao } from '@didtools/cacao'

// DIDSession creation options
export type AuthOptions = {
  domain: string
  expirationTime?: string | null
  expiresInSecs?: number
  nonce?: string
  requestId?: string
  resources: Array<string>
  statement?: string
}

// AuthMethod parameters
export type AuthParams = {
  domain: string
  expirationTime?: string | null
  nonce?: string
  requestId?: string
  resources: Array<string>
  statement?: string
  uri: string
}

export type AuthMethod = (params: AuthParams) => Promise<Cacao>
