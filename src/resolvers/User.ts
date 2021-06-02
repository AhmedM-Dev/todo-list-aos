import { v4 as uuidv4 } from 'uuid'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { Arg, Query, Resolver, InputType, Field, Mutation, Authorized, UseMiddleware, MiddlewareFn, Ctx } from 'type-graphql'
import { IsEmail, MinLength } from 'class-validator'
import cryptyo from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { User } from '../entities/User'

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

@InputType({ description: 'Update user data' })
class UpdateUserInput implements Partial<User> {
  @Field()
  id: string

  @Field({ nullable: true })
  @IsEmail()
  email?: string

  @Field({ nullable: true })
  username?: string

  @Field({ nullable: true })
  role?: Role

  @Field({ nullable: true })
  @MinLength(5)
  password?: string
}

interface Context {
  user?: User
}

// A middleware function to check whether it is allowed to update a user
const IsAllowedToUpdateUser: MiddlewareFn<Context> = async ({ args, context }, next) => {
  if (context.user?.role !== Role.ADMIN && context.user?.id !== args.id) {
    throw new Error('Forbidden')
  }

  return next()
}

@Resolver(User)
export class UserResolver {
  private userRepository: MongoRepository<User> = getMongoRepository(User)

  @Query(() => String, { nullable: true })
  async getToken(@Arg('email') email: string, @Arg('password') password: string) {
    // Fetching the concerned user by its email
    const user = await this.userRepository.findOne({ email })

    // Checking if the user with the provided email exists
    if (!user) throw new Error('User not found!')

    // Checking password matching
    const passwordMatch = bcrypt.compareSync(password, user.password)

    if (!passwordMatch) throw new Error('Invalid password!')

    // If the password provided is correct, we generate a new user token
    const token = jwt.sign(JSON.parse(JSON.stringify(user)), process.env.SECRET as string, { algorithm: 'HS256' })

    // Returning the generated token formatted as 'Bearer [token]'
    return `Bearer ${token}`
  }

  // Only thee admin can list all users
  @Authorized(Role.ADMIN)
  @Query(() => [User], { nullable: true })
  getAllUsers() {
    return this.userRepository.find()
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async getUser(@Arg('id') id: string, @Ctx() context: Context) {
    // Only the admin or the user himself can access his own data
    if (context.user?.role !== Role.ADMIN && id !== context.user?.id) {
      throw new Error("Forbidde, you don't have the right to acces this user's infos")
    }

    const user = await this.userRepository.findOne({ id })

    return user
  }

  // Only the admin can add new users
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

  @Authorized()
  @Mutation(() => User, { nullable: true })
  @UseMiddleware(IsAllowedToUpdateUser)
  async updateUser(@Arg('data') newUserData: UpdateUserInput): Promise<User | undefined> {
    const { id, ...data } = newUserData

    // Fetching the concerned user from database
    const user = await this.userRepository.findOne({ id })

    // Checking if the user exist
    if (!user) throw new Error('User not found!')

    // Proceeding with user update
    await this.userRepository.updateOne({ _id: id }, { $set: data })

    // Fetching and returning the newly updated user
    return this.userRepository.findOne({ id })
  }

  // Only the admin can delete users
  @Authorized(Role.ADMIN)
  @Mutation(() => String, { nullable: true })
  async deleteUser(@Arg('id') id: string): Promise<string> {
    const result = await this.userRepository.deleteOne({ _id: id })

    // Returning a message to the admin depending on the deletion result
    return result.result.n !== 0 ? 'Successfully deleted user.' : 'Cloud not delete the user!'
  }
}
