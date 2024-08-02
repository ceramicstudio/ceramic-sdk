import { Anchor, Tooltip } from '@mantine/core'

export type Props = {
  id: string
  onClick: () => void
}

export default function EventAnchor({ id, onClick }: Props) {
  return (
    <Tooltip label={id}>
      <Anchor onClick={onClick} style={{ fontFamily: 'monospace' }}>
        {id}
      </Anchor>
    </Tooltip>
  )
}
