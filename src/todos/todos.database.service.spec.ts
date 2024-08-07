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

  describe('update()', () => {
    const id = new Types.ObjectId().toString()
    const updateParams: UpdateTodoDto = {
      title: 'Updated title',
      description: 'Updated description',
    }
    const updatedTodo = {
      _id: id,
      title: updateParams.title,
      description: updateParams.description,
      toObject: jest.fn(),
    }

    it('should call method with correct arguments', async () => {
      mockTodoModel.findByIdAndUpdate.mockImplementation(() => updatedTodo)
      await todosDatabaseService.update(id, updateParams)
      expect(mockTodoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateParams,
        { new: true },
      )
    })

    it('should return correct value', async () => {
      mockTodoModel.findByIdAndUpdate.mockReturnValue(updatedTodo)
      await expect(
        todosDatabaseService.update(id, updateParams),
      ).resolves.toEqual(updatedTodo.toObject())
    })

    it('should throw NotFoundError if todo not found', async () => {
      mockTodoModel.findByIdAndUpdate.mockReturnValue(null)
      await expect(
        todosDatabaseService.update('nonExistentId', updateParams),
      ).rejects.toThrow(NotFoundError)
    })
  })
})
