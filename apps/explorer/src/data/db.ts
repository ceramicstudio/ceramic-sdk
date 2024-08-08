import { Kysely, Migrator, type Selectable } from 'kysely'
import { SQLocalKysely } from 'sqlocal/kysely'

import * as migration0 from './migrations/0-init.ts'
import type { EventsTable, InsertEvent, Tables } from './types.ts'

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

export async function queryEvents(): Promise<Array<Selectable<EventsTable>>> {
  await dbReady
  return await db.selectFrom('events').selectAll().execute()
}
