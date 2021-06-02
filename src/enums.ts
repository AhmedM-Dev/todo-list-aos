import { registerEnumType } from 'type-graphql'

export enum Role {
  ADMIN = 'ADMIN',
  BASIC = 'BASIC'
}

registerEnumType(Role, {
  name: 'Role',
  description: 'The user roles'
})

export enum TaskStatus {
  COMPLETED = 'COMPLETED',
  NOT_COMPLETED = 'NOT COMPLETED'
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'The task possible status'
})
