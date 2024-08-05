import { User } from '../../src/user/schemas/user.schema'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}
