import { Types } from 'mongoose'

import type { User } from '../../user/schemas/user.schema'

export type UserWithoutPassword = Omit<User, 'password'>

export interface UserJwtPayload extends UserWithoutPassword {
  sub?: Types.ObjectId
}
