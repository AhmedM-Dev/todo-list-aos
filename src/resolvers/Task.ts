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

  @FieldResolver()
  comments(@Root() task: Task) {
    return this.commentRepository.find({ taskId: task.id })
  }

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

  @Authorized()
  @Query(() => [Task], { nullable: true })
  getOwnTasks(@Ctx() context: Context) {
    return this.taskRepository.find({ ownerId: context.user?.id })
  }

  @Authorized()
  @Query(() => Task, { nullable: true })
  async getTask(@Arg('id') id: string, @Ctx() context: Context) {
    const task = await this.taskRepository.findOne({ id })

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
    const newTaskId = uuidv4()

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

    const task = await this.taskRepository.findOne({ id })

    if (!task) throw new Error('Task not found!')

    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    await this.taskRepository.updateOne({ _id: id }, { $set: data })

    return this.taskRepository.findOne({ id })
  }

  @Authorized()
  @Mutation(() => Task, { nullable: true })
  async completeTask(@Arg('data') taskData: CompleteTaskInput, @Ctx() context: Context): Promise<Task | undefined> {
    const { id, status } = taskData

    const task = await this.taskRepository.findOne({ id })

    if (!task) throw new Error('Task not found!')

    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    await this.taskRepository.updateOne({ _id: id }, { $set: { status } })

    return this.taskRepository.findOne({ id })
  }

  @Authorized()
  @Mutation(() => Task, { nullable: true })
  async shareTask(@Arg('data') data: ShareTaskInput, @Ctx() context: Context): Promise<Task | undefined> {
    const { id, toUsersIds } = data

    const task = await this.taskRepository.findOne({ id })

    if (!task) throw new Error('Task not found!')

    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    const newAccess = [...new Set([...task.access, ...toUsersIds])]

    await this.taskRepository.updateOne({ _id: id }, { $set: { access: newAccess } })

    return this.taskRepository.findOne({ id })
  }

  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async deleteTask(@Arg('id') id: string, @Ctx() context: Context): Promise<boolean> {
    const task = await this.taskRepository.findOne({ id })

    if (!task) throw new Error('Task not found!')

    if (task.ownerId !== context.user?.id) throw new Error('Forbidden, you are not the owner of this task!')

    const result = await this.taskRepository.deleteOne({ _id: id })

    return result.result === { n: 1, ok: 1 }
  }
}
