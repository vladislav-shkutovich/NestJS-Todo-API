import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { hash } from 'src/common/utils/crypto.utils'
import type { User } from './schemas/user.schema'

@Injectable()
export class UserService {
  async findUserByUsername(username: string): Promise<User | undefined> {
    const users: User[] = [
      {
        _id: new Types.ObjectId(),
        username: 'test',
        password: await hash('test'),
      },
    ]

    return users.find((user) => user.username === username)
  }
}
