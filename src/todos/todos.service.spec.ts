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

  describe('createTodo()', () => {
    const enteredTodo: CreateTodoDto = {
      title: 'Test title',
      description: 'Test description',
    }
    const userId = new Types.ObjectId()

    it('should call method with correct arguments', async () => {
      await todosService.createTodo(enteredTodo, userId)
      expect(todosDatabaseService.createTodo).toHaveBeenCalledWith(
        enteredTodo,
        userId,
      )
    })

    it('should return correct value', async () => {
      const createdTodo: Todo = {
        _id: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        ...enteredTodo,
      }
      todosDatabaseService.createTodo.mockResolvedValue(createdTodo)
      await expect(
        todosService.createTodo(enteredTodo, userId),
      ).resolves.toEqual(createdTodo)
    })
  })

  describe('getAllTodos()', () => {
    it('should call method with correct arguments', async () => {
      await todosService.getAllTodos()
      expect(todosDatabaseService.getAllTodos).toHaveBeenCalled()
    })

    it('should return correct value', async () => {
      const todoList: Todo[] = [
        {
          _id: new Types.ObjectId(),
          title: 'Test title',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: new Types.ObjectId(),
        },
      ]
      todosDatabaseService.getAllTodos.mockResolvedValue(todoList)
      await expect(todosService.getAllTodos()).resolves.toEqual(todoList)
    })
  })

  describe('getTodoById()', () => {
    const id = new Types.ObjectId().toString()

    it('should call method with correct arguments', async () => {
      await todosService.getTodoById(id)
      expect(todosDatabaseService.getTodoById).toHaveBeenCalledWith(id)
    })

    it('should return correct value', async () => {
      const todo: Todo = {
        _id: new Types.ObjectId(id),
        title: 'Test title',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: new Types.ObjectId(),
      }
      todosDatabaseService.getTodoById.mockResolvedValue(todo)
      await expect(todosService.getTodoById(id)).resolves.toEqual(todo)
    })
  })

  describe('updateTodo()', () => {
    const todoId = new Types.ObjectId().toString()
    const userId = new Types.ObjectId()
    const updateParams: UpdateTodoDto = {
      description: 'test updated description',
    }

    it('should call method with correct arguments', async () => {
      await todosService.updateTodo(todoId, userId, updateParams)
      expect(todosDatabaseService.updateTodo).toHaveBeenCalledWith(
        todoId,
        userId,
        updateParams,
      )
    })

    it('should return correct value', async () => {
      const updatedTodo: Todo = {
        _id: new Types.ObjectId(todoId),
        userId,
        title: 'Test title',
        description: updateParams.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      todosDatabaseService.updateTodo.mockResolvedValue(updatedTodo)
      await expect(
        todosService.updateTodo(todoId, userId, updateParams),
      ).resolves.toEqual(updatedTodo)
    })
  })

  describe('deleteTodo()', () => {
    it('should call method with correct argument', async () => {
      const id = new Types.ObjectId().toString()
      await todosService.deleteTodo(id)
      expect(todosDatabaseService.deleteTodo).toHaveBeenCalledWith(id)
    })
  })
})
