import { type Kysely, sql } from 'kysely'

import type { Tables } from '../types.ts'

export async function up(db: Kysely<Tables>): Promise<void> {
  await db.schema
    .createTable('events')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('init_id', 'text', (col) => col.notNull())
    .addColumn('prev_id', 'text')
    .addColumn('car_bytes', 'binary', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => {
      return col.defaultTo(sql`(unixepoch())`).notNull()
    })
    .execute()

  await db.schema
    .createIndex('event_init_index')
    .on('events')
    .column('init_id')
    .execute()
}

export async function down(db: Kysely<Tables>): Promise<void> {
  await db.schema.dropTable('events').execute()
}
