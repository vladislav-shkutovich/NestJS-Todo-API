import { Test, TestingModule } from '@nestjs/testing'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { createMock } from '@golevelup/ts-jest'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'

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

  it('should call create method with correct arguments', async () => {
    const todoItem: CreateTodoDto = {
      title: 'Test title',
      description: 'Test description',
    }
    await todosService.create(todoItem)

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
    const updateParams: UpdateTodoDto = {
      description: 'test updated description',
    }
    await todosService.update(id, updateParams)

    expect(todosDatabaseService.update).toHaveBeenCalledWith(id, updateParams)
  })

  it('should call delete method with correct argument', async () => {
    const id = '1'
    await todosService.delete(id)

    expect(todosDatabaseService.delete).toHaveBeenCalledWith(id)
  })
})
