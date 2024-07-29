import { Alert, Loader } from '@mantine/core'
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'

import { useClientQuery } from '../hooks.ts'

export default function DisplayVersion() {
  const versionQuery = useClientQuery(['version'], (client) => {
    return client.getVersion()
  })

  return versionQuery.data ? (
    <Alert
      color="green"
      title="Ceramic server is accessible"
      icon={<IconCircleCheck />}
    >
      Server version: {versionQuery.data.version}
    </Alert>
  ) : versionQuery.error ? (
    <Alert
      color="red"
      title="Failed to access Ceramic server"
      icon={<IconExclamationCircle />}
    >
      {versionQuery.error.message}
    </Alert>
  ) : (
    <Alert
      color="blue"
      title="Loading Ceramic server version..."
      icon={<Loader size="sm" color="blue" />}
    />
  )
}
