import { Alert } from '@mantine/core'
import { IconCircleCheck } from '@tabler/icons-react'

import { useServerVersion } from '../hooks.ts'

export default function DisplayVersion() {
  const result = useServerVersion()

  return result.data ? (
    <Alert
      color="green"
      title="Ceramic node is accessible"
      icon={<IconCircleCheck />}>
      Ceramic One version: {result.data}
    </Alert>
  ) : null
}
