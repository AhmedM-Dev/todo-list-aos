import { getMongoManager } from 'typeorm'

import { User } from '../model/User'

import { Role } from '../enums'

async function seedDatabase() {
  const manager = getMongoManager()

  const defaultUser = await manager.findOne(User, { email: 'admin@todolist.aos' })

  if (!defaultUser) {
    const admin = await manager.insertOne(User, {
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
