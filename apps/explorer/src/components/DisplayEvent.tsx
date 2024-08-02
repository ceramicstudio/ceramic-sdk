import { StreamID } from '@ceramic-sdk/identifiers'
import { Code, ScrollArea, Space, Text } from '@mantine/core'

import { useEventContainer } from '../hooks.ts'

import EventDetails from './EventDetails.tsx'

export type Props = {
  id: string
  onSelectEvent: (id: string) => void
}

export default function DisplayEvent(props: Props) {
  const result = useEventContainer(props.id)

  return result.data ? (
    <>
      <EventDetails
        id={props.id}
        event={result.data.payload}
        onSelectEvent={props.onSelectEvent}
      />
      <Space h="md" />
      <Text>Payload:</Text>
      <ScrollArea h="400px">
        <Code block>
          {JSON.stringify(
            result.data.payload,
            (_key, value) => {
              if (StreamID.isInstance(value)) {
                return `StreamID(${value.toString()})`
              }
              return value
            },
            2,
          )}
        </Code>
      </ScrollArea>
    </>
  ) : null
}
