import { Test, TestingModule } from '@nestjs/testing'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Types } from 'mongoose'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { Todo } from './schemas/todos.schema'

describe('TodosService', () => {
  let todosService: TodosService
  let todosDatabaseService: DeepMocked<TodosDatabaseService>

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
      module.get<DeepMocked<TodosDatabaseService>>(TodosDatabaseService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('create()', () => {
    const enteredTodo: CreateTodoDto = {
      title: 'Test title',
      description: 'Test description',
    }

    it('should call method with correct arguments', async () => {
      await todosService.create(enteredTodo)
      expect(todosDatabaseService.create).toHaveBeenCalledWith(enteredTodo)
    })

    it('should return correct value', async () => {
      const createdTodo: Todo = {
        _id: new Types.ObjectId(),
        ...enteredTodo,
      }
      todosDatabaseService.create.mockResolvedValue(createdTodo)
      await expect(todosService.create(enteredTodo)).resolves.toEqual(
        createdTodo,
      )
    })
  })

  describe('getAll()', () => {
    it('should call method with correct arguments', async () => {
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
      todosDatabaseService.getAll.mockResolvedValue(todoList)
      await expect(todosService.getAll()).resolves.toEqual(todoList)
    })
  })

  describe('getById()', () => {
    const id = new Types.ObjectId().toString()

    it('should call method with correct arguments', async () => {
      await todosService.getById(id)
      expect(todosDatabaseService.getById).toHaveBeenCalledWith(id)
    })

    it('should return correct value', async () => {
      const todo: Todo = {
        _id: new Types.ObjectId(id),
        title: 'Test title',
        description: 'Test description',
      }
      todosDatabaseService.getById.mockResolvedValue(todo)
      await expect(todosService.getById(id)).resolves.toEqual(todo)
    })
  })

  describe('update()', () => {
    const id = new Types.ObjectId().toString()
    const updateParams: UpdateTodoDto = {
      description: 'test updated description',
    }

    it('should call method with correct arguments', async () => {
      await todosService.update(id, updateParams)
      expect(todosDatabaseService.update).toHaveBeenCalledWith(id, updateParams)
    })

    it('should return correct value', async () => {
      const updatedTodo: Todo = {
        _id: new Types.ObjectId(id),
        title: 'Test title',
        description: updateParams.description,
      }
      todosDatabaseService.update.mockResolvedValue(updatedTodo)
      await expect(todosService.update(id, updateParams)).resolves.toEqual(
        updatedTodo,
      )
    })
  })

  describe('delete()', () => {
    it('should call method with correct argument', async () => {
      const id = new Types.ObjectId().toString()
      await todosService.delete(id)
      expect(todosDatabaseService.delete).toHaveBeenCalledWith(id)
    })
  })
})
