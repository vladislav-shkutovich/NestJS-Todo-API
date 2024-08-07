import { User } from '../../user/schemas/user.schema'

export type UserWithoutPassword = Omit<User, 'password'>
