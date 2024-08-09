import {
  Alert,
  Box,
  Grid,
  type MantineStyleProp,
  NavLink,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { Link, Outlet } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'

import CopyCodeBlock from '../components/CopyCodeBlock.tsx'
import {
  useEventsFeed,
  useStoredEventIDs,
  useSyncEventsFeed,
} from '../hooks.ts'

const CURL_COMMAND =
  'curl -X POST "http://localhost:5101/ceramic/interests/model/kh4q0ozorrgaq2mezktnrmdwleo1d"'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_connected/events')({
  component: EventsFeed,
})

function EventsFeed() {
  // TODO: get new events from this feed + whether the feed has any event
  useSyncEventsFeed()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStoredEventIDs()
  const storedEventIDsLoaded = data
    ? data.pages.flatMap((page) => page.ids)
    : []

  const containerRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: hasNextPage
      ? storedEventIDsLoaded.length + 1
      : storedEventIDsLoaded.length,
    estimateSize: () => 40,
    getScrollElement: () => containerRef.current,
  })

  const virtualItems = virtualizer.getVirtualItems()
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= storedEventIDsLoaded.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    storedEventIDsLoaded.length,
    virtualItems,
  ])

  // const feed = useEventsFeed()
  // const pages = feed.data?.pages ?? []
  // const firstPageEvents = pages[0]?.events

  // if (firstPageEvents == null) {
  //   return null
  // }

  // if (firstPageEvents.length === 0) {
  //   return (
  //     <Alert color="orange" title="No events">
  //       <Text>No events are stored on the Ceramic node yet!</Text>
  //       <Text>
  //         To start receiving events for the models created on the network, run
  //         the following command:
  //       </Text>
  //       <CopyCodeBlock code={CURL_COMMAND} />
  //     </Alert>
  //   )
  // }

  const items = virtualItems.map((item) => {
    const style: MantineStyleProp = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: `${item.size}px`,
      transform: `translateY(${item.start}px)`,
    }

    if (item.index > storedEventIDsLoaded.length - 1) {
      return (
        <Box key="loading" style={style}>
          <Text>Loading...</Text>
        </Box>
      )
    }

    const id = storedEventIDsLoaded[item.index]
    return (
      <Tooltip key={id} label={id}>
        <NavLink
          component={Link}
          to="/events/$id"
          params={{ id }}
          label={id}
          style={{ ...style, fontFamily: 'monospace' }}
          rightSection={<IconChevronRight />}
        />
      </Tooltip>
    )
  })

  return (
    <>
      <Title order={2}>Events</Title>
      <Grid mt="sm">
        <Grid.Col
          ref={containerRef}
          span={4}
          style={{ height: 'calc(100vh - 160px)', overflow: 'auto' }}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}>
            {items}
          </div>
        </Grid.Col>
        <Grid.Col span={8}>
          <Outlet />
        </Grid.Col>
      </Grid>
    </>
  )
}
