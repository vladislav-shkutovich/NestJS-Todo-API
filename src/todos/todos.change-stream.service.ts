import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { ChangeStream } from 'mongodb'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import type { Todo } from './schemas/todos.schema'
import type { User } from '../user/schemas/user.schema'

@Injectable()
export class TodosChangeStreamService implements OnModuleInit, OnModuleDestroy {
  private changeStream: ChangeStream

  constructor(
    @InjectModel(TODO_MODEL) private todoModel: Model<Todo>,
    @InjectModel(USER_MODEL) private userModel: Model<User>,
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
          operationType: { $in: ['insert', 'update', 'delete'] },
        },
      },
    ]

    this.changeStream = this.todoModel.watch(pipeline)

    this.changeStream.on('change', async (changeStreamDoc) => {
      if (changeStreamDoc.operationType === 'insert') {
        const createdTodo = changeStreamDoc.fullDocument as Todo
        const user = await this.userModel.findById(createdTodo.userId)

        if (user) {
          user.todos = user.todos.reduce(
            (todos, todo) => {
              if (todos.length < 5) {
                todos.push(todo)
              }
              return todos
            },
            [createdTodo],
          )

          await user.save()
        }
      }

      if (changeStreamDoc.operationType === 'update') {
        const updatedTodo = await this.todoModel.findById(
          changeStreamDoc.documentKey._id,
        )
        if (updatedTodo) {
          const user = await this.userModel.findById(updatedTodo.userId)

          if (user) {
            user.todos = user.todos.reduce(
              (todos, todo) => {
                if (todos.length < 5 && !todo._id.equals(updatedTodo._id)) {
                  todos.push(todo)
                }
                return todos
              },
              [updatedTodo.toObject()],
            )

            await user.save()
          }
        }
      }

      if (changeStreamDoc.operationType === 'delete') {
        const deletedTodoId = changeStreamDoc.documentKey._id
        const user = await this.userModel.findOne({
          'todos._id': deletedTodoId,
        })

        if (user) {
          user.todos = await this.todoModel
            .find({ userId: user._id.toString() })
            .sort({ updatedAt: -1 })
            .limit(5)

          await user.save()
        }
      }
    })
  }

  private async closeChangeStream() {
    this.changeStream.close()
  }
}