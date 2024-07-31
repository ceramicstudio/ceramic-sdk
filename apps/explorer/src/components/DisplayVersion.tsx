import { Alert } from '@mantine/core'
import { IconCircleCheck } from '@tabler/icons-react'

import { useServerVersion } from '../hooks.ts'

export default function DisplayVersion() {
  const result = useServerVersion()

  return result.data ? (
    <Alert
      color="green"
      title="Ceramic server is accessible"
      icon={<IconCircleCheck />}>
      Server version: {result.data}
    </Alert>
  ) : null
}
