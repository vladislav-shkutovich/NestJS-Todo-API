import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type {
  ChangeStream,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  ChangeStreamDeleteDocument,
} from 'mongodb'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import type { User } from '../user/schemas/user.schema'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosChangeStreamDatabaseService {
  private changeStreamOnCreate?: ChangeStream
  private changeStreamOnUpdate?: ChangeStream
  private changeStreamOnDelete?: ChangeStream

  constructor(
    @InjectModel(TODO_MODEL) private readonly todoModel: Model<Todo>,
    @InjectModel(USER_MODEL) private readonly userModel: Model<User>,
  ) {}

  subscribeOnTodoCreate(callback: (todo: Todo) => void): void {
    if (!this.changeStreamOnCreate) {
      this.changeStreamOnCreate = this.todoModel.watch([
        {
          $match: {
            operationType: 'insert',
          },
        },
      ])
    }

    this.changeStreamOnCreate.on(
      'change',
      async (changeStreamDoc: ChangeStreamInsertDocument) => {
        const createdTodo = changeStreamDoc.fullDocument as Todo
        callback(createdTodo)
      },
    )
  }

  subscribeOnTodoUpdate(callback: (todo: Todo) => void): void {
    if (!this.changeStreamOnUpdate) {
      this.changeStreamOnUpdate = this.todoModel.watch(
        [
          {
            $match: {
              operationType: 'update',
            },
          },
        ],
        { fullDocument: 'updateLookup' },
      )
    }

    this.changeStreamOnUpdate.on(
      'change',
      async (changeStreamDoc: ChangeStreamUpdateDocument) => {
        const updatedTodo = changeStreamDoc.fullDocument as Todo
        callback(updatedTodo)
      },
    )
  }

  // TODO: - Get only todoId in subscribeOnTodoDelete and send it into new UserService method (without changes as it was before);
  subscribeOnTodoDelete(callback: (todo: Todo) => void): void {
    if (!this.changeStreamOnDelete) {
      this.changeStreamOnDelete = this.todoModel.watch([
        {
          $match: {
            operationType: 'delete',
          },
        },
      ])
    }

    this.changeStreamOnDelete.on(
      'change',
      async (changeStreamDoc: ChangeStreamDeleteDocument) => {
        const deletedTodoId = changeStreamDoc.documentKey._id

        const userWithDeletedTodo = await this.userModel.findOne(
          {
            'todos._id': deletedTodoId,
          },
          {
            'todos.$': 1,
          },
        )

        if (userWithDeletedTodo) {
          callback(userWithDeletedTodo.todos[0])
        }
      },
    )
  }

  // TODO: - Realize unsubscribe method in TodosChangeStreamDatabaseService;
  async unsubscribe() {}
}
