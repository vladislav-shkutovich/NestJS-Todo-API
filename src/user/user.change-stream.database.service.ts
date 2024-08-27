import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { ChangeStreamDocument } from 'mongodb'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import { ChangeStreamService } from '../common/services/change-stream.service'
import type { Todo } from '../todos/schemas/todos.schema'
import type { User } from './schemas/user.schema'

@Injectable()
export class UserChangeStreamDatabaseService extends ChangeStreamService<User> {
  constructor(
    @InjectModel(USER_MODEL) userModel: Model<User>,
    @InjectModel(TODO_MODEL) private readonly todoModel: Model<Todo>,
  ) {
    super(userModel, [
      {
        $match: {
          operationType: 'delete',
        },
      },
    ])
  }

  protected async handleChange(changeStreamDoc: ChangeStreamDocument) {
    if (changeStreamDoc.operationType === 'delete') {
      const deletedUserId = changeStreamDoc.documentKey._id

      // ? ⬇️ Question: discuss on call with Zhenya `_id.toString()`, `new ObjectId("...")` and so on.
      await this.todoModel.deleteMany({ userId: deletedUserId.toString() })
    }
  }
}
