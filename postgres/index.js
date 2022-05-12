import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({ hostname: 'localhost', database: 'rasmus', user: 'rasmus' })
await client.connect()

export default {
  queries: {
    select: () => client.queryArray`select 1 as x`,
    select_arg: () => client.queryArray`select ${ 1 } as x`,
    select_args: () => client.queryArray`select
      ${ 1337 }::int as int,
      ${ 'wat' }::text as string,
      ${ new Date() }::timestamptz as timestamp,
      ${ null } as null,
      ${ false }::bool as boolean,
      ${ JSON.stringify([{ some: 'json' }, { array: 'object' }]) }::jsonb as json
    `,
    select_where: () => client.queryArray`select * from pg_catalog.pg_type where typname = ${ 'bool' }`
  },
  end: () => client.end()
}
