import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('meal').notNullable()
    table.text('description').notNullable()
    table.boolean('isOnDiet').notNullable()
    table.datetime('dateTime', { precision: 6 }).notNullable()
    table.uuid('session_id').after('id').index()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
