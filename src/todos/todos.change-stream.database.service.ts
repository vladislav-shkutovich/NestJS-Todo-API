import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { ChangeStreamDocument } from 'mongodb'

import { OPERATIONS } from '../common/constants/common.constants'
import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import { ChangeStreamService } from '../common/services/change-stream.service'
import type {
  OperationCallback,
  OperationType,
} from '../common/types/common.types'
import type { User } from '../user/schemas/user.schema'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosChangeStreamDatabaseService extends ChangeStreamService<Todo> {
  eventListeners = new Map<OperationType, OperationCallback[]>()

  constructor(
    @InjectModel(TODO_MODEL) private readonly todoModel: Model<Todo>,
    @InjectModel(USER_MODEL) private readonly userModel: Model<User>,
  ) {
    super(todoModel, [
      {
        $match: {
          operationType: {
            $in: [OPERATIONS.INSERT, OPERATIONS.UPDATE, OPERATIONS.DELETE],
          },
        },
      },
    ])
  }

  addEventListener(event: OperationType, callback: OperationCallback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.push(callback)
    } else this.eventListeners.set(event, [callback])
  }

  protected async handleChange(changeStreamDoc: ChangeStreamDocument) {
    if (changeStreamDoc.operationType === OPERATIONS.INSERT) {
      const createdTodo = changeStreamDoc.fullDocument as Todo
      const insertCallbacks = this.eventListeners.get(OPERATIONS.INSERT)

      if (insertCallbacks) {
        insertCallbacks.forEach((callback) => {
          callback(createdTodo.userId, createdTodo)
        })
      }
    }

    if (changeStreamDoc.operationType === OPERATIONS.UPDATE) {
      const updatedTodo = await this.todoModel.findById(
        changeStreamDoc.documentKey._id,
      )
      const updateCallbacks = this.eventListeners.get(OPERATIONS.UPDATE)

      if (updatedTodo && updateCallbacks) {
        updateCallbacks.forEach((callback) => {
          callback(updatedTodo.userId, updatedTodo)
        })
      }
    }

    if (changeStreamDoc.operationType === OPERATIONS.DELETE) {
      const deletedTodoId = changeStreamDoc.documentKey._id
      const deleteCallbacks = this.eventListeners.get(OPERATIONS.DELETE)

      const user = await this.userModel.findOne({
        'todos._id': deletedTodoId,
      })

      if (user) {
        const isDeletedTodoInUser = user.todos.some((todo) =>
          todo._id.equals(deletedTodoId),
        )

        if (isDeletedTodoInUser && deleteCallbacks) {
          deleteCallbacks.forEach((callback) => {
            callback(user._id.toString())
          })
        }
      }
    }
  }
}
