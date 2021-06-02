import { v4 as uuidv4 } from 'uuid'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { Arg, Query, Resolver, InputType, Field, Mutation, Authorized } from 'type-graphql'
import { IsEmail, MinLength } from 'class-validator'
import cryptyo from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { User } from '../model/User'

import { Role } from '../enums'

@InputType({ description: 'New user data' })
class AddUserInput implements Partial<User> {
  @Field()
  @IsEmail()
  email: string

  @Field()
  username: string

  @Field({ defaultValue: Role.BASIC, nullable: true })
  role?: Role

  @Field({ nullable: true })
  @MinLength(5)
  password?: string
}

@Resolver(User)
export class UserResolver {
  private userRepository: MongoRepository<User> = getMongoRepository(User)

  @Query(() => String, { nullable: true })
  async auth(@Arg('email') email: string, @Arg('password') password: string) {
    const user = await this.userRepository.findOne({ email })

    if (!user) throw new Error('User not found!')

    const passwordMatch = bcrypt.compareSync(password, user.password)

    if (!passwordMatch) throw new Error('Invalid password!')

    const token = jwt.sign(JSON.parse(JSON.stringify(user)), process.env.SECRET as string, { algorithm: 'HS256' })

    return `Bearer ${token}`
  }

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

  @Authorized(Role.ADMIN)
  @Mutation(() => User, { nullable: true })
  async addUser(@Arg('data') newUserData: AddUserInput): Promise<User | undefined> {
    const newUserId = uuidv4()

    const result = await this.userRepository.insertOne({
      _id: newUserId,
      id: newUserId,
      ...newUserData,
      password: bcrypt.hashSync(newUserData.password || cryptyo.randomBytes(8).toString('hex'))
    })

    return result?.ops?.[0]
  }
}
