import { createConnection, Connection } from 'typeorm'

import consoleLoader from './utils/consoleLoader'

export let connection: Connection

const initDbConnection = async () => {
  const loaderId = consoleLoader('Connecting to MongoDB database', (process.env.TYPEORM_CONNECTION_RETRIES_SLEEP || 100) as number)

  let retries = (process.env.TYPEORM_CONNECTION_RETRIES || 5) as number

  while (retries) {
    try {
      if (retries < ((process.env.TYPEORM_CONNECTION_RETRIES || 5) as number)) {
        console.info('\x1b[34m%s\x1b[0m', '\nℹ', 'Retrying connecting to database...')
      }

      connection = await createConnection(process.env.NODE_ENV === 'docker' ? 'docker' : 'default')
      consoleLoader.stop(loaderId)
      console.info('\x1b[32m%s\x1b[0m', '\n✔', 'Successfully connected to MongoDB database.')
      break
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', '\n✖', 'Failed to connect to MongoDB database server!')
      console.log(error)
      retries -= 1
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  return Boolean(retries)
}

export default initDbConnection
