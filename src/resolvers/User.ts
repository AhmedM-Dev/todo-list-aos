import { Query, Resolver } from 'type-graphql'

import { User } from '../types'

@Resolver(User)
export class UserResolver {
  private usersCollection: User[] = []

  @Query(returns => [User])
  async getAllUsers() {
    return this.usersCollection
  }
}
