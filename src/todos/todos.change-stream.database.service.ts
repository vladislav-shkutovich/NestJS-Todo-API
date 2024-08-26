import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { ChangeStreamDocument } from 'mongodb'

import { Operations } from '../common/constants/common.constants'
import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import { ChangeStreamService } from '../common/services/change-stream.service'
import type { OperationCallback } from '../common/types/common.types'
import type { User } from '../user/schemas/user.schema'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosChangeStreamDatabaseService extends ChangeStreamService<Todo> {
  private eventListeners = new Map<Operations, OperationCallback[]>(
    Object.values(Operations).map((operation) => [operation, []]),
  )

  constructor(
    @InjectModel(TODO_MODEL) private readonly todoModel: Model<Todo>,
    @InjectModel(USER_MODEL) private readonly userModel: Model<User>,
  ) {
    super(todoModel, [
      {
        $match: {
          operationType: {
            $in: ['insert', 'update', 'delete'],
          },
        },
      },
    ])
  }

  addEventListener(event: Operations, callback: OperationCallback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.push(callback)
    } else this.eventListeners.set(event, [callback])
  }

  protected async handleChange(changeStreamDoc: ChangeStreamDocument) {
    if (changeStreamDoc.operationType === 'insert') {
      const createdTodo = changeStreamDoc.fullDocument as Todo
      const insertCallbacks = this.eventListeners.get(Operations.INSERT)

      if (insertCallbacks) {
        insertCallbacks.forEach((callback) => {
          callback(createdTodo.userId, createdTodo)
        })
      }
    }

    if (changeStreamDoc.operationType === 'update') {
      // TODO: - Get fullDocument from update lookup instead of finding user in DB for its id;
      const updatedTodo = await this.todoModel.findById(
        changeStreamDoc.documentKey._id,
      )
      const updateCallbacks = this.eventListeners.get(Operations.UPDATE)

      if (updatedTodo && updateCallbacks) {
        updateCallbacks.forEach((callback) => {
          callback(updatedTodo.userId, updatedTodo)
        })
      }
    }

    if (changeStreamDoc.operationType === 'delete') {
      const deletedTodoId = changeStreamDoc.documentKey._id
      const deleteCallbacks = this.eventListeners.get(Operations.DELETE)

      // TODO: - Get fullDocument from update lookup instead of finding user in DB for its id;
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
