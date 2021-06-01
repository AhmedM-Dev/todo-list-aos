import { v4 as uuidv4 } from 'uuid'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { Arg, Query, Resolver, InputType, Field, Mutation } from 'type-graphql'
import cryptyo from 'crypto'

import { User } from '../model/User'

import { Role } from '../enums'

@InputType({ description: 'New user data' })
class AddUserInput implements Partial<User> {
  @Field()
  email: string

  @Field()
  username: string

  @Field({ defaultValue: Role.BASIC, nullable: true })
  role?: Role
}

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

  @Mutation(() => User, { nullable: true })
  async addUser(@Arg('data') newUserData: AddUserInput): Promise<User | undefined> {
    const newUserId = uuidv4()

    const result = await this.userRepository.insertOne({
      _id: newUserId,
      id: newUserId,
      ...newUserData,
      password: cryptyo.randomBytes(8).toString('hex')
    })

    return result?.ops?.[0]
  }
}
