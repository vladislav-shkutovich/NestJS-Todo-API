import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { ChangeStreamDocument } from 'mongodb'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import { ChangeStreamService } from '../common/services/change-stream.service'
import type { Todo } from './schemas/todos.schema'
import type { User } from '../user/schemas/user.schema'

@Injectable()
export class TodosChangeStreamDatabaseService extends ChangeStreamService<Todo> {
  eventListeners = new Map()

  constructor(
    @InjectModel(TODO_MODEL) private readonly todoModel: Model<Todo>,
    @InjectModel(USER_MODEL) private readonly userModel: Model<User>,
  ) {
    super(todoModel, [
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'delete'] },
        },
      },
    ])
  }

  addEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).push(callback)
    } else this.eventListeners.set(event, [callback])
  }

  protected async handleChange(changeStreamDoc: ChangeStreamDocument) {
    if (changeStreamDoc.operationType === 'insert') {
      const createdTodo = changeStreamDoc.fullDocument as Todo

      this.eventListeners.get('create').forEach((callback) => {
        callback(createdTodo?.userId, createdTodo)
      })
    }

    if (changeStreamDoc.operationType === 'update') {
      const updatedTodo = await this.todoModel.findById(
        changeStreamDoc.documentKey._id,
      )

      this.eventListeners.get('update').forEach((callback) => {
        callback(updatedTodo?.userId, updatedTodo)
      })
    }

    if (changeStreamDoc.operationType === 'delete') {
      const deletedTodoId = changeStreamDoc.documentKey._id
      const user = await this.userModel.findOne({
        'todos._id': deletedTodoId,
      })

      if (user?.todos?.some((todo) => todo._id.equals(deletedTodoId))) {
        user.todos = await this.todoModel
          .find({ userId: user._id.toString() })
          .sort({ updatedAt: -1 })
          .limit(5)

        await user.save()
      }
    }
  }
}
