import { useEventContainer } from '../hooks.ts'

import EventDetails from './EventDetails.tsx'

export type Props = {
  id: string
  onSelectEvent: (id: string) => void
}

export default function DisplayEvent(props: Props) {
  const result = useEventContainer(props.id)

  return result.data ? (
    <EventDetails
      id={props.id}
      event={result.data.payload}
      onSelectEvent={props.onSelectEvent}
    />
  ) : null
}
