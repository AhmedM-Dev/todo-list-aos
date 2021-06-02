import { v4 as uuidv4 } from 'uuid'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { Arg, Query, Resolver, InputType, Field, Mutation, Authorized, Ctx, FieldResolver, Root } from 'type-graphql'
import { IsEmail, MinLength } from 'class-validator'

import { User, Task, Comment } from '../entities'

import { TaskStatus } from '../enums'

@InputType({ description: 'New task input data' })
class AddTaskInput implements Partial<Task> {
  @Field()
  @MinLength(3)
  name: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true, defaultValue: TaskStatus.NOT_COMPLETED })
  status?: TaskStatus
}

@InputType({ description: 'Modify task infos' })
class UpdateTaskInput implements Partial<Task> {
  @Field()
  id: string

  @Field({ nullable: true })
  @IsEmail()
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  status?: TaskStatus
}

@InputType({ description: 'Complete / incomplete a specific task' })
class CompleteTaskInput implements Partial<Task> {
  @Field()
  id: string

  @Field()
  status: TaskStatus
}

interface Context {
  user?: User
}

@InputType({ description: 'Complete / incomplete a specific task' })
class ShareTaskInput implements Partial<Task> {
  @Field()
  id: string

  @Field(() => [String], { description: 'Ids of users you want to share a task to.' })
  toUsersIds: string[]
}

interface Context {
  user?: User
}

@Resolver(Task)
export class TaskResolver {
  private taskRepository: MongoRepository<Task> = getMongoRepository(Task)
  private commentRepository: MongoRepository<Comment> = getMongoRepository(Comment)

  // Resolving the current task comments
  @FieldResolver()
  comments(@Root() task: Task) {
    return this.commentRepository.find({ taskId: task.id })
  }

  // A query to get user's all accessed tasks (his own tasks and other tasks shared to him)
  @Authorized()
  @Query(() => [Task], { nullable: true })
  async getAllTasks(@Ctx() context: Context) {
    const allTasks = await this.taskRepository.find({
      where: {
        $or: [{ ownerId: context.user?.id }, { access: context.user?.id }]
      }
    })

    return allTasks
  }

  // A query to only get own user's tasks
  @Authorized()
  @Query(() => [Task], { nullable: true })
  getOwnTasks(@Ctx() context: Context) {
    return this.taskRepository.find({ ownerId: context.user?.id })
  }

  @Authorized()
  @Query(() => Task, { nullable: true })
  async getTask(@Arg('id') id: string, @Ctx() context: Context) {
    // Fetching the concerned task from database
    const task = await this.taskRepository.findOne({ id })

    // Checking if the task exists
    if (!task) throw new Error('Task not found!')

    // The task is visible only to its owner or anyone that it has been shared to
    if (task.ownerId !== context.user?.id && !task.access?.includes(context.user?.id as string)) {
      throw new Error("Forbidden, you can't access this task!")
    }

    return task
  }

  @Authorized()
  @Mutation(() => Task, { nullable: true })
  async addTask(@Arg('data') newTaskData: AddTaskInput, @Ctx() context: Context): Promise<Task | undefined> {
    // Generating an ID for the task
    const newTaskId = uuidv4()

    // Adding the new task with few automatically generated attributes
    const result = await this.taskRepository.insertOne({
      _id: newTaskId,
      id: newTaskId,
      ...newTaskData,
      access: [context.user?.id],
      ownerId: context.user?.id
    })

    return result?.ops?.[0]
  }

  @Authorized()
  @Mutation(() => Task, { nullable: true })
  async updateTask(@Arg('data') taskData: UpdateTaskInput, @Ctx() context: Context): Promise<Task | undefined> {
    const { id, ...data } = taskData

    // Fetching the concerned task from database
    const task = await this.taskRepository.findOne({ id })

    // Checking if the concerned task exists
    if (!task) throw new Error('Task not found!')

    // Only the owner of the task can update it
    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    // Proceeding with task's update
    await this.taskRepository.updateOne({ _id: id }, { $set: data })

    // Returning the newly updated task
    return this.taskRepository.findOne({ id })
  }

  // This mutation work can be done with the 'updateTask' mutation, added just for convenience
  @Authorized()
  @Mutation(() => Task, { nullable: true })
  async completeTask(@Arg('data') taskData: CompleteTaskInput, @Ctx() context: Context): Promise<Task | undefined> {
    const { id, status } = taskData

    // Fetching the concerned task from database
    const task = await this.taskRepository.findOne({ id })

    // Checking if the concerned task exists
    if (!task) throw new Error('Task not found!')

    // Only the owner of the task can complete / incomplete it
    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    // Proceeding with task's completion/incompletion mark
    await this.taskRepository.updateOne({ _id: id }, { $set: { status } })

    // Returning the newly completed/incompleted task
    return this.taskRepository.findOne({ id })
  }

  // A mutation to share tasks with other users
  @Authorized()
  @Mutation(() => Task, { nullable: true })
  async shareTask(@Arg('data') data: ShareTaskInput, @Ctx() context: Context): Promise<Task | undefined> {
    const { id, toUsersIds } = data

    // Fetching the concerned task from database
    const task = await this.taskRepository.findOne({ id })

    // Checking if the concerned task exists
    if (!task) throw new Error('Task not found!')

    // Checking if the current user is the owner of the task to share
    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    // Adding the new users access to the task
    const newAccess = [...new Set([...task.access, ...toUsersIds])]

    // Proceeding with task's update with new access
    await this.taskRepository.updateOne({ _id: id }, { $set: { access: newAccess } })

    // Returning the newly shared task
    return this.taskRepository.findOne({ id })
  }

  @Authorized()
  @Mutation(() => String, { nullable: true })
  async deleteTask(@Arg('id') id: string, @Ctx() context: Context): Promise<string> {
    // Fetching the concerned task from database
    const task = await this.taskRepository.findOne({ id })

    // Checking if the concerned task exists
    if (!task) throw new Error('Task not found!')

    // Only the owner of the task can delete it
    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    const result = await this.taskRepository.deleteOne({ _id: id })

    return result.result.n !== 0 ? 'Successfully deleted task.' : 'Cloud not delete the task!'
  }
}
