import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import type {
  ChangeStream,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  ChangeStreamDeleteDocument,
} from 'mongodb'

import { TODO_MODEL } from '../common/constants/database.constants'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosChangeStreamDatabaseService {
  private changeStreamOnCreate?: ChangeStream<
    Todo,
    ChangeStreamInsertDocument<Todo>
  >
  private changeStreamOnUpdate?: ChangeStream<
    Todo,
    ChangeStreamUpdateDocument<Todo>
  >
  private changeStreamOnDelete?: ChangeStream<
    Todo,
    ChangeStreamDeleteDocument<Todo>
  >

  constructor(
    @InjectModel(TODO_MODEL) private readonly todoModel: Model<Todo>,
  ) {}

  async *subscribeOnTodoCreate(): AsyncGenerator<Todo> {
    if (!this.changeStreamOnCreate) {
      this.changeStreamOnCreate = this.todoModel.watch([
        {
          $match: {
            operationType: 'insert',
          },
        },
      ])
    }

    for await (const changeStreamDoc of this.changeStreamOnCreate
      .driverChangeStream) {
      yield changeStreamDoc.fullDocument
    }

    await this.changeStreamOnCreate.close()
  }

  async *subscribeOnTodoUpdate(): AsyncGenerator<Todo> {
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

    for await (const changeStreamDoc of this.changeStreamOnUpdate
      .driverChangeStream) {
      yield changeStreamDoc.fullDocument!
    }

    await this.changeStreamOnUpdate.close()
  }

  async *subscribeOnTodoDelete(): AsyncGenerator<Types.ObjectId> {
    if (!this.changeStreamOnDelete) {
      this.changeStreamOnDelete = this.todoModel.watch([
        {
          $match: {
            operationType: 'delete',
          },
        },
      ])
    }

    for await (const changeStreamDoc of this.changeStreamOnDelete
      .driverChangeStream) {
      yield changeStreamDoc.documentKey._id
    }

    await this.changeStreamOnDelete.close()
  }
}
