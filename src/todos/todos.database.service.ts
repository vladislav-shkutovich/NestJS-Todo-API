import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NotFoundError } from 'src/common/errors/errors'
import { TODO_MODEL } from 'src/common/constants/database.constants'
import type { Todo } from './schemas/todos.schema'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'

@Injectable()
export class TodosDatabaseService {
  constructor(@InjectModel(TODO_MODEL) private todoModel: Model<Todo>) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const createdTodo = await this.todoModel.create(createTodoDto)
    return createdTodo.toObject()
  }

  async getAll(): Promise<Todo[]> {
    const allTodos = await this.todoModel.find()
    return allTodos.map((todo) => todo.toObject())
  }

  async getById(id: string): Promise<Todo> {
    const todoById = await this.todoModel.findById(id)

    if (!todoById) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return todoById.toObject()
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const updatedTodo = await this.todoModel.findByIdAndUpdate(
      id,
      updateTodoDto,
      {
        new: true,
      },
    )

    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return updatedTodo.toObject()
  }

  async delete(id: string): Promise<void> {
    const deletedTodo = await this.todoModel.findByIdAndDelete(id)

    if (!deletedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }
  }
}
