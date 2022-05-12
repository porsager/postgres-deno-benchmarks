import postgres from 'https://deno.land/x/postgresjs/mod.js'

const sql = postgres({ max: 1 })

export default {
  queries: {
    select: () => sql`select 1 as x`,
    select_arg: () => sql`select ${ 1 } as x`,
    select_args: () => sql`select
      ${ 1337 }::int as int,
      ${ 'wat' }::text as string,
      ${ new Date() }::timestamptz as timestamp,
      ${ null } as null,
      ${ false }::bool as boolean,
      ${ [{ some: 'json' }, { array: 'object' }] }::jsonb as json
    `,
    select_where: () => sql`select * from pg_catalog.pg_type where typname = ${ 'bool' }`
  },
  end: () => sql.end({ timeout: 0 })
}
