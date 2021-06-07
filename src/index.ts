import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import jwt from 'express-jwt'

import initDbConnection from './initDbConnection'

import { UserResolver, TaskResolver, CommentResolver } from './resolvers'

import authChecker from './authChecker'

import seedDatabase from './helpers/seedDatabase'

const PORT = process.env.PORT || 4001

const app = express()
const path = '/graphql'

async function runServer() {
  try {
    // MongoDB database TypeORM connection
    await initDbConnection()

    // seed database with default data
    await seedDatabase()

    // ... Building schema here
    const schema = await buildSchema({
      resolvers: [UserResolver, TaskResolver, CommentResolver],
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
    app.listen({ port: PORT }, () =>
      console.log('\x1b[32m%s\x1b[0m', '✔', `Server is running, GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`)
    )
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✖', 'Failed to start server.')
    console.log(error)
  }
}

runServer()
