import { Kysely, Migrator } from 'kysely'
import { SQLocalKysely } from 'sqlocal/kysely'

import * as migration0 from './migrations/0-init.ts'
import type {
  EventResult,
  InsertEvent,
  QueryEventIDsResult,
  QueryEventsParams,
  QueryEventsResult,
  Tables,
} from './types.ts'

const { dialect } = new SQLocalKysely('ceramic-explorer.sqlite3')
const migrations = { migration0 }

export const db = new Kysely<Tables>({ dialect })

const migrator = new Migrator({
  db,
  provider: {
    getMigrations: () => Promise.resolve(migrations),
  },
})

async function initDB(): Promise<Kysely<Tables>> {
  const { error } = await migrator.migrateToLatest()
  if (error != null) {
    throw new Error(`Failed to run DB migrations: ${error}`)
  }
  return db
}

export const dbReady = initDB()

export async function insertEvents(events: Array<InsertEvent>): Promise<void> {
  await dbReady
  await db
    .insertInto('events')
    .values(events)
    .onConflict((oc) => oc.column('id').doNothing())
    .execute()
}

export async function queryEvents({
  limit,
  cursor,
}: QueryEventsParams = {}): Promise<QueryEventsResult> {
  await dbReady

  const query = db
    .selectFrom('events')
    .selectAll()
    .orderBy('created_at desc')
    .orderBy('id desc')
    .limit(limit ?? 50)

  const events = cursor
    ? await query
        .where((qb) => {
          return qb.or([
            qb('created_at', '=', cursor.created_at).and(
              qb('id', '<', cursor.id),
            ),
            qb('created_at', '<', cursor.created_at),
          ])
        })
        .execute()
    : await query.execute()

  if (events.length === 0) {
    return { events: [] }
  }

  const cursorEvent = events[events.length - 1]
  return {
    events,
    cursor: { created_at: cursorEvent.created_at, id: cursorEvent.id },
  }
}

export async function queryEventIDs({
  limit,
  cursor,
}: QueryEventsParams = {}): Promise<QueryEventIDsResult> {
  await dbReady

  const query = db
    .selectFrom('events')
    .select(['id', 'created_at'])
    .orderBy('created_at desc')
    .orderBy('id desc')
    .limit(limit ?? 50)

  const events = cursor
    ? await query
        .where((qb) => {
          return qb.or([
            qb('created_at', '=', cursor.created_at).and(
              qb('id', '<', cursor.id),
            ),
            qb('created_at', '<', cursor.created_at),
          ])
        })
        .execute()
    : await query.execute()

  if (events.length === 0) {
    return { ids: [] }
  }

  const cursorEvent = events[events.length - 1]
  return {
    ids: events.map((e) => e.id),
    cursor: { created_at: cursorEvent.created_at, id: cursorEvent.id },
  }
}

export async function queryStreamEvents(
  initID: string,
): Promise<Array<EventResult>> {
  await dbReady
  return await db
    .selectFrom('events')
    .selectAll()
    .where('init_id', '=', initID)
    .orderBy('created_at asc')
    .execute()
}
