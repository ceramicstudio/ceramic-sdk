import type { ColumnType, Insertable, Selectable } from 'kysely'

export type EventsTable = {
  id: string
  init_id: string
  prev_id: string | null
  car_bytes: Uint8Array
  created_at: ColumnType<number, number | undefined, never>
}

export type InsertEvent = Insertable<EventsTable>

export type QueryEventsCursor = {
  created_at: number
  id: string
}

export type QueryEventsParams = {
  limit?: number
  cursor?: QueryEventsCursor
}

export type QueryEventsResult = {
  events: Array<Selectable<EventsTable>>
  cursor?: QueryEventsCursor
}

export type QueryEventIDsResult = {
  ids: Array<string>
  cursor?: QueryEventsCursor
}

export type Tables = {
  events: EventsTable
}
