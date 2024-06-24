import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { Types } from 'mongoose'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { Todo } from './schemas/todos.schema'

describe('TodosService', () => {
  let todosService: TodosService
  let todosDatabaseService: TodosDatabaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: TodosDatabaseService,
          useValue: createMock<TodosDatabaseService>(),
        },
      ],
    }).compile()

    todosService = module.get<TodosService>(TodosService)
    todosDatabaseService =
      module.get<TodosDatabaseService>(TodosDatabaseService)
  })

  it('should call create method with correct arguments and return correct value', async () => {
    const enteredTodo: CreateTodoDto = {
      title: 'Test title',
      description: 'Test description',
    }
    const createdTodo: Todo = {
      _id: new Types.ObjectId(),
      ...enteredTodo,
    }

    jest.spyOn(todosDatabaseService, 'create').mockResolvedValue(createdTodo)

    const result = await todosService.create(enteredTodo)

    expect(todosDatabaseService.create).toHaveBeenCalledWith(enteredTodo)
    expect(result).toEqual(createdTodo)
  })

  it('should call getAll method with correct arguments and return correct value', async () => {
    const todoList: Todo[] = [
      {
        _id: new Types.ObjectId(),
        title: 'Test title',
        description: 'Test description',
      },
    ]

    jest.spyOn(todosDatabaseService, 'getAll').mockResolvedValue(todoList)

    const result = await todosService.getAll()

    expect(todosDatabaseService.getAll).toHaveBeenCalled()
    expect(result).toEqual(todoList)
  })

  it('should call getById method with correct arguments and return correct value', async () => {
    const id = new Types.ObjectId()
    const todo: Todo = {
      _id: id,
      title: 'Test title',
      description: 'Test description',
    }

    jest.spyOn(todosDatabaseService, 'getById').mockResolvedValue(todo)

    const result = await todosService.getById(id.toString())

    expect(todosDatabaseService.getById).toHaveBeenCalledWith(id.toString())
    expect(result).toEqual(todo)
  })

  it('should call update method with correct arguments and return correct value', async () => {
    const id = new Types.ObjectId()
    const updateParams: UpdateTodoDto = {
      description: 'test updated description',
    }
    const updatedTodo: Todo = {
      _id: id,
      title: 'Test title',
      description: updateParams.description,
    }

    jest.spyOn(todosDatabaseService, 'update').mockResolvedValue(updatedTodo)

    const result = await todosService.update(id.toString(), updateParams)

    expect(todosDatabaseService.update).toHaveBeenCalledWith(
      id.toString(),
      updateParams,
    )
    expect(result).toEqual(updatedTodo)
  })

  it('should call delete method with correct argument', async () => {
    const id = new Types.ObjectId().toString()
    await todosService.delete(id)

    expect(todosDatabaseService.delete).toHaveBeenCalledWith(id)
  })
})
