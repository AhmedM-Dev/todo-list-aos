import { Field, ID, ObjectType } from 'type-graphql'
import { Entity, ObjectIdColumn, Column } from 'typeorm'

@ObjectType({ description: 'This entity represents a task comment' })
@Entity()
export class Comment {
  @Field(() => ID)
  @ObjectIdColumn()
  readonly id: string

  @Field()
  @Column()
  authorId: string

  @Field()
  @Column()
  text: string

  @Field(() => Date)
  @Column(() => Date)
  date: Date

  @Field()
  @Column()
  taskId: string
}
