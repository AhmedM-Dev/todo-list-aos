import { Field, ID, ObjectType } from 'type-graphql'
import { Entity, ObjectIdColumn, Column } from 'typeorm'

import { TaskStatus } from '../enums'

@ObjectType()
@Entity()
export class Task {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: string

  @Field()
  @Column()
  name: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string

  @Field(() => TaskStatus, { defaultValue: TaskStatus.NOT_COMPLETED })
  @Column({ default: TaskStatus.NOT_COMPLETED })
  status: TaskStatus

  @Field(() => [String])
  @Column()
  access: string[]

  @Field()
  @Column()
  ownerId: string
}
