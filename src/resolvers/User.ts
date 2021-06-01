import { Query, Resolver } from 'type-graphql'

import { User } from '../model/user'

@Resolver(User)
export class UserResolver {
  private usersCollection: User[] = []

  @Query(() => [User])
  getAllUsers() {
    return this.usersCollection
  }
}
