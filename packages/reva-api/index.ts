import fastify from 'fastify'
import mercurius from 'mercurius'


const server = fastify({ logger: true })

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`

const resolvers = {
  Query: {
    add: async (_: any, { x, y }: { x: number, y: number }) => x + y
  }
}


server.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
})


server.get('/ping', async (request, reply) => {
  return 'pong'
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
