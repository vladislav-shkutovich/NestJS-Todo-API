import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

export interface User {
  userId: number
  username: string
  password: string
}

@Injectable()
export class UserService {
  private users: User[] = [
    {
      userId: 1,
      username: 'test',
      password: bcrypt.hashSync('test', 15),
    },
  ]

  async findUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username)
  }
}
