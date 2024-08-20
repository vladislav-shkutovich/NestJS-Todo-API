import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { TodosDatabaseService } from './todos.database.service'
import { NotFoundError } from 'src/common/errors/errors'
import { TODO_MODEL } from 'src/common/constants/database.constants'
import { UpdateTodoDto } from './dto/update-todo.dto'

describe('TodosDatabaseService', () => {
  let todosDatabaseService: TodosDatabaseService
  const mockTodoModel = {
    findByIdAndUpdate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosDatabaseService,
        {
          provide: getModelToken(TODO_MODEL),
          useValue: mockTodoModel,
        },
      ],
    }).compile()

    todosDatabaseService =
      module.get<TodosDatabaseService>(TodosDatabaseService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('updateTodo()', () => {
    const todoId = new Types.ObjectId().toString()
    const userId = new Types.ObjectId()
    const updateParams: UpdateTodoDto = {
      title: 'Updated title',
      description: 'Updated description',
    }
    const updatedTodo = {
      _id: todoId,
      userId,
      title: updateParams.title,
      description: updateParams.description,
      toObject: jest.fn(),
    }

    it('should call method with correct arguments', async () => {
      mockTodoModel.findByIdAndUpdate.mockImplementation(() => updatedTodo)
      await todosDatabaseService.updateTodo(todoId, userId, updateParams)
      expect(mockTodoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        todoId,
        { userId, ...updateParams },
        { new: true },
      )
    })

    it('should return correct value', async () => {
      mockTodoModel.findByIdAndUpdate.mockReturnValue(updatedTodo)
      await expect(
        todosDatabaseService.updateTodo(todoId, userId, updateParams),
      ).resolves.toEqual(updatedTodo.toObject())
    })

    it('should throw NotFoundError if todo not found', async () => {
      mockTodoModel.findByIdAndUpdate.mockReturnValue(null)
      await expect(
        todosDatabaseService.updateTodo('nonExistentId', userId, updateParams),
      ).rejects.toThrow(NotFoundError)
    })
  })
})
