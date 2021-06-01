import { Field, ID, ObjectType } from 'type-graphql'
import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm'

import { Role } from '../enums'

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: ObjectID

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  email?: string

  @Field()
  @Column({ unique: true })
  username: string

  @Field(() => Role)
  @Column()
  role: Role

  @Column()
  password: string
}
