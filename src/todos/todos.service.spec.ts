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

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create()', () => {
    const enteredTodo: CreateTodoDto = {
      title: 'Test title',
      description: 'Test description',
    }

    it('should call create method with correct arguments', async () => {
      await todosService.create(enteredTodo)
      expect(todosDatabaseService.create).toHaveBeenCalledWith(enteredTodo)
    })

    it('should return correct value', async () => {
      const createdTodo: Todo = {
        _id: new Types.ObjectId(),
        ...enteredTodo,
      }
      jest.spyOn(todosDatabaseService, 'create').mockResolvedValue(createdTodo)
      const result = await todosService.create(enteredTodo)
      expect(result).toEqual(createdTodo)
    })
  })

  describe('getAll()', () => {
    it('should call getAll method with correct arguments', async () => {
      await todosService.getAll()
      expect(todosDatabaseService.getAll).toHaveBeenCalled()
    })

    it('should return correct value', async () => {
      const todoList: Todo[] = [
        {
          _id: new Types.ObjectId(),
          title: 'Test title',
          description: 'Test description',
        },
      ]
      jest.spyOn(todosDatabaseService, 'getAll').mockResolvedValue(todoList)
      const result = await todosService.getAll()
      expect(result).toEqual(todoList)
    })
  })

  describe('getById()', () => {
    const id = new Types.ObjectId().toString()

    it('should call getById method with correct arguments', async () => {
      await todosService.getById(id)
      expect(todosDatabaseService.getById).toHaveBeenCalledWith(id)
    })

    it('should return correct value', async () => {
      const todo: Todo = {
        _id: new Types.ObjectId(id),
        title: 'Test title',
        description: 'Test description',
      }
      jest.spyOn(todosDatabaseService, 'getById').mockResolvedValue(todo)
      const result = await todosService.getById(id)
      expect(result).toEqual(todo)
    })
  })

  describe('update()', () => {
    const id = new Types.ObjectId().toString()
    const updateParams: UpdateTodoDto = {
      description: 'test updated description',
    }

    it('should call update method with correct arguments', async () => {
      await todosService.update(id, updateParams)
      expect(todosDatabaseService.update).toHaveBeenCalledWith(id, updateParams)
    })

    it('should return correct value', async () => {
      const updatedTodo: Todo = {
        _id: new Types.ObjectId(id),
        title: 'Test title',
        description: updateParams.description,
      }
      jest.spyOn(todosDatabaseService, 'update').mockResolvedValue(updatedTodo)
      const result = await todosService.update(id, updateParams)
      expect(result).toEqual(updatedTodo)
    })
  })

  it('should call delete method with correct argument', async () => {
    const id = new Types.ObjectId().toString()
    await todosService.delete(id)
    expect(todosDatabaseService.delete).toHaveBeenCalledWith(id)
  })
})
