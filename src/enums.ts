import { registerEnumType } from 'type-graphql'

export enum Role {
  ADMIN = 'ADMIN',
  BASIC = 'BASIC'
}

registerEnumType(Role, {
  name: 'Role', // this one is mandatory
  description: 'The user roles' // this one is optional
})
