import type { UserWithoutPassword } from '../../src/common/types/user-types'

declare module 'express' {
  interface Request {
    user: UserWithoutPassword
  }
}
