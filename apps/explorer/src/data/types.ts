import type { ColumnType, Insertable } from 'kysely'

export type EventsTable = {
  id: string
  init_id: string
  prev_id: string | null
  car_bytes: Uint8Array
  created_at: ColumnType<Date, number | undefined, never>
}

export type InsertEvent = Insertable<EventsTable>

export type Tables = {
  events: EventsTable
}
