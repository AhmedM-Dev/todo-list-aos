import { v4 as uuidv4 } from 'uuid'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { Arg, Query, Resolver, InputType, Field, Mutation, Authorized, Ctx, FieldResolver, Root } from 'type-graphql'
import { MinLength } from 'class-validator'

import { User, Comment, Task } from '../entities'

@InputType({ description: 'New comment input data' })
class AddCommentInput implements Partial<Comment> {
  @Field()
  @MinLength(1)
  text: string

  @Field()
  taskId: string
}

@InputType({ description: 'Update comment data' })
class UpdateCommentInput implements Partial<Comment> {
  @Field()
  id: string

  @Field()
  @MinLength(1)
  text: string
}

interface Context {
  user?: User
}

@Resolver(Comment)
export class CommentResolver {
  private commentRepository: MongoRepository<Comment> = getMongoRepository(Comment)
  private userRepository: MongoRepository<User> = getMongoRepository(User)
  private taskRepository: MongoRepository<Task> = getMongoRepository(Task)

  @FieldResolver(() => User, { nullable: true })
  author(@Root() comment: Comment): Promise<User | undefined> {
    return this.userRepository.findOne({ id: comment.authorId })
  }

  @Authorized()
  @Query(() => [Comment], { nullable: true })
  getMyComments() {
    return this.commentRepository.find()
  }

  @Authorized()
  @Mutation(() => Comment, { nullable: true })
  async addComment(@Arg('data') newCommentData: AddCommentInput, @Ctx() context: Context): Promise<Comment | undefined> {
    // Generating an ID for the new comment
    const newCommentId = uuidv4()

    // Fetching the task in which the user wants to comment
    const task = await this.taskRepository.findOne({ id: newCommentData.taskId })

    // CHecking if the task exists
    if (!task) throw new Error('Error, you can not comment on a non existant task!')

    // Adding the new comment and getting back the result response
    const result = await this.commentRepository.insertOne({
      _id: newCommentId,
      id: newCommentId,
      ...newCommentData,
      authorId: context.user?.id,
      date: new Date()
    })

    return result?.ops?.[0]
  }

  @Authorized()
  @Mutation(() => Comment, { nullable: true })
  async updateComment(@Arg('data') commentData: UpdateCommentInput, @Ctx() context: Context): Promise<Comment | undefined> {
    const { id, ...data } = commentData

    // Fetching the concerned comment by its id
    const comment = await this.commentRepository.findOne({ id })

    // Check if the comment exists
    if (!comment) throw new Error('Error, comment not found!')

    // Check if the user that launched the update request is the owner of the comment
    if (comment.authorId !== context.user?.id) throw new Error('Error, you can not modify comments of other users!')

    // Updating the comment with the provided data
    await this.commentRepository.updateOne({ _id: id }, { $set: data })

    // Returning the updated comment
    return this.commentRepository.findOne({ id })
  }

  @Authorized()
  @Mutation(() => String, { nullable: true })
  async deleteComment(@Arg('id') id: string, @Ctx() context: Context): Promise<string> {
    // Fetching the concerned comment by its id
    const comment = await this.commentRepository.findOne({ id })

    // Check if the comment exists
    if (!comment) throw new Error('Error, comment not found!')

    // Check if the user that launched the update request is the owner of the comment
    if (comment.authorId !== context.user?.id) throw new Error('Error, you can not delete comments of other users!')

    // Proceeding of comment deletion and retrieving result
    const result = await this.commentRepository.deleteOne({ _id: id })

    // Returning a message to the user depending on the deletion result
    return result.result.n !== 0 ? 'Successfully deleted comment.' : 'Cloud not delete the comment!'
  }
}
