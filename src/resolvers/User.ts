import { getMongoRepository, MongoRepository } from 'typeorm'
import { Arg, Query, Resolver } from 'type-graphql'

import { User } from '../model/User'

@Resolver(User)
export class UserResolver {
  private userRepository: MongoRepository<User> = getMongoRepository(User)

  @Query(() => [User], { nullable: true })
  getAllUsers() {
    return this.userRepository.find()
  }

  @Query(() => User, { nullable: true })
  async getUser(@Arg('id') id: string) {
    console.log('id', id)

    const user = await this.userRepository.findOne({ id })

    console.log('user', user)

    return user
  }
}
