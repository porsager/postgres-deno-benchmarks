# Postgres Library Benchmarks for Deno

This is a set of benchmarks focusing on the performance of Postgres client libraries for Deno. The benchmarks are primarily direct selects of values to measure the input-output performance and not the Performance of postgres data fetching.

> NB. In daily usage it is very likely that this difference doesn't matter as much since the time spent by the client library is negligable compared to the query time itself.

Currently benchmarked libraries are

- [Postgres.js](https://deno.land/x/postgresjs)
- [Postgres](https://deno.land/x/postgres)

## Results

These are the results from running the benchmarks on a MacBook Pro M1 MAX with a default Postgres 14 installation and Deno.
The time is the average of 5 rounds, running the queries 10,000 times after some warmup rounds.

client     |         select |     select_arg |    select_args |   select_where
:--------- | -------------: | -------------: | -------------: | -------------:
postgres   |  0.578s (1.0x) |  0.678s (1.0x) |  1.048s (1.0x) |  1.933s (1.0x)
postgresjs |  0.145s (4.0x) |  0.168s (4.0x) |  0.293s (3.6x) |  0.281s (6.9x)

## Query descriptions:

#### select

```sql
select 1 as x
```

#### select_arg

```sql
select $1 as x

-- $1 is just 1
```

#### select_args
```sql
select
  $1 as int,
  $2 as string,
  $3 as timestamp,
  $4 as null,
  $5 as boolean,
  $6 as json

--$1 = 1337
--$2 = 'wat'
--$3 = new Date()
--$4 = null
--$5 = false
--$6 = "[{ "some": "json" }, { "array": "object" }]"
```

#### select_where

```sql
select * from pg_catalog.pg_type where typname = $1

--$1 = 'bool'
```


#### Running the benchmark

Ensure you have a PostgreSQL server running. Then

```bash
deno run --unstable --allow-env --allow-net --allow-read index.js 
```
