import {
  Alert,
  Box,
  Breadcrumbs,
  Grid,
  NavLink,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'

import { useEventsFeed } from '../hooks.ts'

import CopyCodeBlock from './CopyCodeBlock.tsx'
import DisplayEvent from './DisplayEvent.tsx'

const CURL_COMMAND =
  'curl -X POST "http://localhost:5101/ceramic/interests/model/kh4q0ozorrgaq2mezktnrmdwleo1d"'

export function EventsFeed() {
  const [selectedID, setSelectedID] = useState<string | null>(null)
  const feed = useEventsFeed()
  const pages = feed.data?.pages ?? []
  const firstPageEvents = pages[0]?.events

  if (firstPageEvents == null) {
    return null
  }

  if (firstPageEvents.length === 0) {
    return (
      <Alert color="orange" title="No events">
        <Text>No events are stored on the Ceramic node yet!</Text>
        <Text>
          To start receiving events for the models created on the network, run
          the following command:
        </Text>
        <CopyCodeBlock code={CURL_COMMAND} />
      </Alert>
    )
  }

  const items = [...pages]
    .reverse()
    .flatMap((page) => [...page.events].reverse())
    .map((event) => {
      return (
        <Tooltip key={event.id} label={event.id}>
          <NavLink
            style={{ fontFamily: 'monospace' }}
            active={selectedID === event.id}
            label={event.id}
            onClick={() => {
              setSelectedID(event.id)
            }}
            rightSection={<IconChevronRight />}
          />
        </Tooltip>
      )
    })

  return (
    <>
      <Breadcrumbs>
        <Title order={4}>Events</Title>
        {selectedID ? <Title order={4}>{selectedID}</Title> : null}
      </Breadcrumbs>
      <Grid mt="sm">
        <Grid.Col
          span={4}
          style={{ height: 'calc(100vh - 160px)', overflow: 'auto' }}>
          <Stack gap="xs">{items}</Stack>
        </Grid.Col>
        <Grid.Col span={8}>
          {selectedID ? (
            <Box style={{ flex: 1, overflow: 'auto' }}>
              <DisplayEvent id={selectedID} onSelectEvent={setSelectedID} />
            </Box>
          ) : (
            <Alert color="blue">Select an event to display details</Alert>
          )}
        </Grid.Col>
      </Grid>
    </>
  )
}
