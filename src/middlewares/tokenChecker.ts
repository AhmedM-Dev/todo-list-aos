import jwt, { JsonWebTokenError, VerifyOptions } from 'jsonwebtoken'
import { Request, Response, NextFunction, RequestHandler } from 'express'

import { Role } from 'enums'

interface IUser {
  id: string
  email?: string
  username: string
  role: Role
}

interface CustomRequest extends Request {
  user: IUser
}

const tokenChecker = (req: CustomRequest, res: Response, next: NextFunction) => {
  const { headers, path } = req

  console.log('path', path)

  if (path !== '/') {
    if ('auth-token' in headers) {
      const token = headers['auth-token'] as string

      const decoded = jwt.verify(token, process.env.SECRET as string)

      console.log('decoded', decoded)

      next()

      // jwt.verify(token, process.env.TOKEN_ENCRYPTION_KEY as string, (err: JsonWebTokenError, decoded: IUser) => {
      //   if (err) return

      //   if (decoded) {
      //     // console.log('decoded', decoded)
      //     req.user = decoded

      //     next()
      //   } else {
      //     return res.status(401).json({
      //       error: 'Unauthenticated: invalid token.'
      //     })
      //   }
      // })
    }
  }

  next()
}

export default tokenChecker
