const queries = [
      'select',
      'select_arg',
      'select_args',
      'select_where'
    ]
    , clients = [
      'postgres',
      'postgresjs'
    ]
    , warmup = 3
    , iterations = 10000
    , rounds = 5
    , variance = false

const keepAlive = setTimeout(() => {}, 10000)

const series = (fn, xs) => {
  const results = []
  return xs.reduce((acc, x) => acc.then(() => fn(x).then(r => results.push(r))), Promise.resolve({})).then(() => results)
}

series(test, clients).then(results => {
  results.forEach(x => {
    x.queries = Object.values(x.queries).filter(q => q.times).map(q => {
      q.times = q.times.slice(warmup).map(x => x / 1000)
      const avg = (q.times.reduce((a, b) => a + b) / q.times.length)
          , sorted = q.times.slice().sort((a, b) => a - b)

      return {
        time: avg,
        variance: 1 / sorted[0] * (sorted[sorted.length - 1] - sorted[0]) * 100
      }
    })
  })

  queries.forEach((q, i) =>
    results.map(x => x.queries[i]).sort((a, b) => b.time - a.time).forEach((x, i, xs) => {
      x.diff = xs[0].time / x.time
    })
  )

  console.log([pad(1, 10, ' ')('client')].concat(queries.map(pad(0, 14, ' '))).join(' | '))
  console.log([pad(1, 10, '-')(':')].concat(queries.map(x => ':').map(pad(0, 14, '-'))).join(' | '))
  results.forEach(x =>
    console.log(
      [pad(1, 10, ' ')(x.client)].concat(
        x.queries.map(x =>
          x.time.toFixed(3) + 's' + ' (' + x.diff.toFixed(1) + 'x)'
        ).map(pad(0, 14, ' '))
      ).join(' | ')
    )
  )

  console.log(['client'].concat(queries).join(';'))
  results.forEach(x =>
    console.log([x.client].concat(x.queries.map(x => x.time.toFixed(3))).join(';').replace(/\./g, ','))
  )

  clearTimeout(keepAlive)
})

function pad(p, n, c) {
  return x => {
    while (x.length < n)
      x = p ? x + c : c + x
    return x
  }
}

async function test(clientName, done) {
  return new Promise(async resolve => {
    const client = (await import('./' + clientName + '/index.js')).default
    const q = queries.flatMap(x => Array(rounds + warmup).fill(x))

    async function run(x) {
      x.start = performance.now()
      let j = 0
      for(let i = 0; i < iterations; i++)
        x().then(() => ++j === iterations && next(x))
    }

    function next(x) {
      x && (x.times = (x.times || []).concat([performance.now() - x.start]))
      q.length
        ? setTimeout(() => run(client.queries[q.pop()]), 100)
        : Promise.resolve(client.end()).then(() => resolve({ client: clientName, queries: client.queries }))
    }

    next()
  })
}
