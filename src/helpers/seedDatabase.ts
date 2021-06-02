import { v4 as uuidv4 } from 'uuid'
import { getMongoManager } from 'typeorm'

import { User } from '../entities/User'

import { Role } from '../enums'

async function seedDatabase() {
  const manager = getMongoManager()

  const defaultUser = await manager.findOne(User, { email: 'admin@todolist.aos' })

  if (!defaultUser) {
    const id = uuidv4()

    const admin = await manager.insertOne(User, {
      _id: id,
      id,
      email: 'admin@todolist.aos',
      username: 'admin',
      password: 'admin',
      role: Role.ADMIN
    })

    return { defaultUser: admin }
  }

  return {
    defaultUser
  }
}

export default seedDatabase
