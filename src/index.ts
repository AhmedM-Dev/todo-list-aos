import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'

import { UserResolver } from './resolvers'

import seedDatabase from './helpers/seedDatabase'

const PORT = process.env.PORT || 4000

async function runServer() {
  // MongoDB database TypeORM connection

  // create TypeORM connection
  await createConnection()

  // seed database with some data
  await seedDatabase()

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
