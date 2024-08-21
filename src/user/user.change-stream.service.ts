import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { ChangeStream } from 'mongodb'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import type { Todo } from '../todos/schemas/todos.schema'
import type { User } from './schemas/user.schema'

// TODO: - Refactor User and Todo change stream services using abstract class to reuse common logic;

@Injectable()
export class UserChangeStreamService implements OnModuleInit, OnModuleDestroy {
  private changeStream: ChangeStream
  private resumeToken: unknown

  constructor(
    @InjectModel(USER_MODEL) private userModel: Model<User>,
    @InjectModel(TODO_MODEL) private todoModel: Model<Todo>,
  ) {}

  async onModuleInit() {
    this.openChangeStream()
  }

  async onModuleDestroy() {
    this.closeChangeStream()
  }

  private async openChangeStream() {
    const pipeline = [
      {
        $match: {
          operationType: 'delete',
        },
      },
    ]
    const changeStreamOptions = this.resumeToken
      ? { startAfter: this.resumeToken }
      : {}

    this.changeStream = this.userModel.watch(pipeline, changeStreamOptions)

    this.changeStream.on('change', async (changeStreamDoc) => {
      this.resumeToken = changeStreamDoc._id

      if (changeStreamDoc.operationType === 'delete') {
        const deletedUserId = changeStreamDoc.documentKey._id

        await this.todoModel.deleteMany({ userId: deletedUserId.toString() })
      }
    })
  }

  private async closeChangeStream() {
    this.changeStream.close()
  }
}
