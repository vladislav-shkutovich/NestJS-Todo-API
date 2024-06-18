import { Module } from '@nestjs/common'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { TodosController } from './todos.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { TodoItemSchema } from './schemas/todos.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'TodoItem', schema: TodoItemSchema }]),
  ],
  providers: [TodosService, TodosDatabaseService],
  controllers: [TodosController],
})
export class TodosModule {}
