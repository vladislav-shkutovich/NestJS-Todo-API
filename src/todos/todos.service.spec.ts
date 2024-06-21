import { Test, TestingModule } from '@nestjs/testing'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import type { Todo } from './schemas/todos.schema'

describe('TodosService', () => {
  let todosService: TodosService
  let todosDatabaseService: TodosDatabaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: TodosDatabaseService,
          useValue: {
            create: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    todosService = module.get<TodosService>(TodosService)
    todosDatabaseService =
      module.get<TodosDatabaseService>(TodosDatabaseService)
  })

  it('should call create method with correct arguments', async () => {
    const todoItem: Omit<Todo, '_id'> = {
      title: 'Test title',
      description: 'Test description',
    }
    await todosService.create(todoItem as Todo)

    expect(todosDatabaseService.create).toHaveBeenCalledWith(todoItem)
  })

  it('should call getAll method with correct arguments', async () => {
    await todosService.getAll()

    expect(todosDatabaseService.getAll).toHaveBeenCalled()
  })

  it('should call getById method with correct arguments', async () => {
    const id = '1'
    await todosService.getById(id)

    expect(todosDatabaseService.getById).toHaveBeenCalledWith(id)
  })

  it('should call update method with correct arguments', async () => {
    const id = '1'
    const newParams: Partial<Todo> = { description: 'test updated description' }
    await todosService.update(id, newParams)

    expect(todosDatabaseService.update).toHaveBeenCalledWith(id, newParams)
  })

  it('should call delete method with correct argument', async () => {
    const id = '1'
    await todosService.delete(id)

    expect(todosDatabaseService.delete).toHaveBeenCalledWith(id)
  })
})