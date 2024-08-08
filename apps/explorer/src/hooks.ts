import type { CeramicClient } from '@ceramic-sdk/http-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { decodeEvent, pullFromFeed } from './events.ts'
import {
  ceramicClientAtom,
  feedResumeTokenAtom,
  feedSyncEnabledAtom,
} from './state.ts'

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

export function useEventContainer(id: string) {
  return useClientQuery(['events', id], async (client) => {
    const event = await client.getEvent(id)
    if (event.data == null) {
      throw new Error('Missing event data')
    }
    return await decodeEvent(event.data)
  })
}

export function useEventsFeed() {
  const client = useAtomValue(ceramicClientAtom)
  return useInfiniteQuery({
    queryKey: ['events'],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      return client.getEventsFeed({ resumeAt: pageParam })
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.resumeToken,
    maxPages: 10,
    refetchInterval: 10_000, // 10 seconds
  })
}

export function useSyncEventsFeed() {
  const client = useAtomValue(ceramicClientAtom)
  const isEnabled = useAtomValue(feedSyncEnabledAtom)
  const [initialResumeToken, setResumeAt] = useAtom(feedResumeTokenAtom)
  const isLoading = useRef(false)
  const resumeToken = useRef<string | undefined>(initialResumeToken)

  const loadNext = useCallback(async () => {
    isLoading.current = true
    const [hasResults, newResumeToken] = await pullFromFeed(
      client,
      resumeToken.current,
    )
    console.log('loaded events, has results:', hasResults, newResumeToken)
    setResumeAt(newResumeToken)
    resumeToken.current = newResumeToken
    isLoading.current = false
    if (hasResults) {
      loadNext()
    } else {
      setTimeout(() => {
        loadNext()
      }, 10_000)
    }
  }, [client, setResumeAt])

  useEffect(() => {
    if (isEnabled && !isLoading.current) {
      loadNext()
    }
  }, [isEnabled, loadNext])
}
