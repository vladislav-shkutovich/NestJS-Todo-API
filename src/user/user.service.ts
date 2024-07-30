import { Injectable } from '@nestjs/common'

import { hash } from 'src/common/utils/crypto.utils'

export interface User {
  userId: number
  username: string
  password: string
}

@Injectable()
export class UserService {
  async findUserByUsername(username: string): Promise<User | undefined> {
    const users: User[] = [
      {
        userId: 1,
        username: 'test',
        password: await hash('test'),
      },
    ]

    return users.find((user) => user.username === username)
  }
}
