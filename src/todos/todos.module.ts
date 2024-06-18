import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { TodosController } from './todos.controller'
import { TodoSchema } from './schemas/todos.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Todo', schema: TodoSchema }])],
  providers: [TodosService, TodosDatabaseService],
  controllers: [TodosController],
})
export class TodosModule {}
