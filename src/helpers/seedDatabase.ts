import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

import { connection } from '../initDbConnection'

import { User } from '../entities/User'

import { Role } from '../enums'

async function seedDatabase() {
  const manager = connection.getMongoRepository(User)

  try {
    const defaultUser = await manager.findOne({ email: 'admin@todolist.aos' })

    if (!defaultUser) {
      const id = uuidv4()

      const admin = await manager.insertOne({
        _id: id,
        id,
        email: 'admin@todolist.aos',
        username: 'admin',
        password: bcrypt.hashSync('admin'),
        role: Role.ADMIN
      })

      return { defaultUser: admin }
    }

    console.info('\x1b[32m%s\x1b[0m', '✔', 'Successfully seeded database with minimal data.')

    return {
      defaultUser
    }
  } catch (error) {
    console.info('\x1b[31m%s\x1b[0m', '✖', 'Failed to seed database!')

    return null
  }
}

export default seedDatabase
