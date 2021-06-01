import { Field, ID, ObjectType } from 'type-graphql'
import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm'

import { Role } from '../enums'

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID

  @Field()
  @Column()
  email?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  username: string

  @Field(() => Role, { nullable: true })
  @Column({ nullable: true })
  role: Role

  @Column()
  password: string
}
