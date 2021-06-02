import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import jwt from 'express-jwt'

import { UserResolver } from './resolvers'

import authChecker from './authChecker'

import seedDatabase from './helpers/seedDatabase'

const PORT = process.env.PORT || 4000

const app = express()
const path = '/graphql'

async function runServer() {
  // MongoDB database TypeORM connection
  await createConnection()

  // seed database with default data
  await seedDatabase()

  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [UserResolver],
    authChecker
  })

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req, user: req.user }),
    playground: true
  })

  app.use(
    path,
    jwt({
      algorithms: ['HS256'],
      secret: process.env.SECRET as string,
      credentialsRequired: false
    }).unless({ path: ['/', '/auth'] })
  )

  server.applyMiddleware({ app, path })

  // Launch the server
  app.listen({ port: PORT }, () => console.log(`Server is running, GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`))
}

runServer()
