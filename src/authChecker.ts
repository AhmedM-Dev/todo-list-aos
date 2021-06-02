import { AuthChecker } from 'type-graphql'

import { User } from './model/User'

interface Context {
  user?: User
}

// create auth checker function
const authChecker: AuthChecker<Context> = ({ context: { user } }, roles) => {
  console.log('user', user)

  if (roles.length === 0) {
    // if `@Authorized()`, check only if user exists
    return user !== undefined
  }
  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    return false
  }
  if (roles.includes(user.role)) {
    // grant access if the roles overlap
    return true
  }

  // no roles matched, restrict access
  return false
}

export default authChecker
