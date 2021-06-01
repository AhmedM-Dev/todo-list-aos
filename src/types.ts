import { Field, ID, ObjectType } from 'type-graphql'

import { Role } from './enums'

@ObjectType({ description: 'The user model' })
export class User {
  @Field(_type => ID)
  id: string

  @Field()
  username: string

  @Field({ nullable: true })
  email?: string

  @Field(type => Role)
  role: Role
}

@ObjectType({ description: 'The task model' })
export class Task {
  @Field(type => ID)
  id: string

  @Field()
  username: string

  @Field({ nullable: true })
  email?: string
}

@ObjectType({ description: 'The com,ment model' })
export class Comment {
  @Field(type => ID)
  id: string

  @Field()
  username: string

  @Field({ nullable: true })
  email?: string
}
