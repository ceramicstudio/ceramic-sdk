import type { CeramicClient } from '@ceramic-sdk/http-client'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { ceramicClientAtom } from './state.ts'

export function useClientQuery<T>(
  key: Array<string>,
  executeQuery: (client: CeramicClient) => Promise<T>,
) {
  const client = useAtomValue(ceramicClientAtom)
  return useQuery({
    queryKey: key,
    queryFn: (): Promise<T> => executeQuery(client),
  })
}

export function useServerVersion() {
  const client = useAtomValue(ceramicClientAtom)
  const { data, ...result } = useQuery({
    queryKey: ['version'],
    queryFn: () => client.getVersion(),
  })
  return data ? { ...result, data: data.version } : result
}
