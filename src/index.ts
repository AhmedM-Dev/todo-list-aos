import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'

import { UserResolver } from './resolvers'

const PORT = process.env.PORT || 4000

async function runServer() {
  // MongoDB database connection

  await createConnection()

  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [UserResolver]
  })

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    playground: true
  })

  // Start the server
  const { url } = await server.listen(PORT)
  console.log(`Server is running, GraphQL Playground available at ${url}`)
}

runServer()
