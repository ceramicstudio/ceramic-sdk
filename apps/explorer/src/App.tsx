import '@mantine/core/styles.css'
import { Center, MantineProvider, Text, Title } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'

import { useClientQuery } from './hooks.ts'

const queryClient = new QueryClient()

function Providers({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>{children}</MantineProvider>
      </QueryClientProvider>
    </JotaiProvider>
  )
}

function DisplayVersion() {
  const versionQuery = useClientQuery(['version'], (client) =>
    client.getVersion(),
  )

  const display = versionQuery.data ? (
    <Title>Ceramic server version: {versionQuery.data.version}</Title>
  ) : versionQuery.error ? (
    <Text>
      Error loading Ceramic server version: {versionQuery.error.message}
    </Text>
  ) : (
    <Text>Loading Ceramic server version...</Text>
  )

  return <Center>{display}</Center>
}

export default function App() {
  return (
    <Providers>
      <DisplayVersion />
    </Providers>
  )
}
