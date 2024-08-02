import {
  DocumentDataEventPayload,
  DocumentInitEventPayload,
} from '@ceramic-sdk/document-protocol'
import { TimeEvent } from '@ceramic-sdk/events'
import {
  ModelInitEventPayload,
  getModelStreamID,
} from '@ceramic-sdk/model-protocol'
import { Badge, Stack, Text, Tooltip } from '@mantine/core'
import { IconClock, IconCodeDots } from '@tabler/icons-react'
import { CID } from 'multiformats'

import type { SupportedPayload } from '../events.ts'

import { EventAnchor } from './EventAnchor.tsx'

export type Props = {
  id: string
  event: SupportedPayload
  onSelectEvent: (id: string) => void
}

export default function EventDetails(props: Props) {
  if (TimeEvent.is(props.event)) {
    const event = props.event as TimeEvent
    return (
      <Stack>
        <Badge size="lg" leftSection={<IconClock />}>
          Time event
        </Badge>
        <Text truncate>
          Init event:{' '}
          <EventAnchor
            id={event.id.toString()}
            onClick={() => {
              props.onSelectEvent(event.id.toString())
            }}
          />
        </Text>
        <Text truncate>
          Previous event:{' '}
          <EventAnchor
            id={event.prev.toString()}
            onClick={() => {
              props.onSelectEvent(event.prev.toString())
            }}
          />
        </Text>
      </Stack>
    )
  }

  if (ModelInitEventPayload.is(props.event)) {
    const streamID = getModelStreamID(CID.parse(props.id)).toString()
    return (
      <Stack>
        <Badge size="lg" leftSection={<IconCodeDots />}>
          Model init event
        </Badge>
        <Text truncate>
          StreamID:{' '}
          <Tooltip label={streamID}>
            <Text span style={{ fontFamily: 'monospace' }}>
              {streamID}
            </Text>
          </Tooltip>
        </Text>
      </Stack>
    )
  }

  if (DocumentInitEventPayload.is(props.event)) {
    return <Text>Document init event</Text>
  }
  if (DocumentDataEventPayload.is(props.event)) {
    return <Text>Document data event</Text>
  }
  return <Text>Unknown event type</Text>
}
