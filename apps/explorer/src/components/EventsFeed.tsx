import { Alert, Box, List, Text, Title } from '@mantine/core'

import { useEventsFeed } from '../hooks.ts'

import CopyCodeBlock from './CopyCodeBlock.tsx'

const CURL_COMMAND =
  'curl -X POST "http://localhost:5101/ceramic/interests/model/kh4q0ozorrgaq2mezktnrmdwleo1d"'

export function EventsFeed() {
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

  const items = pages
    .flatMap((page) => page.events)
    .map((event) => {
      return <List.Item key={event.id}>{event.id}</List.Item>
    })

  return (
    <Box>
      <Title>Events feed</Title>
      <List>{items}</List>
    </Box>
  )
}
