import { Module } from '@nestjs/common'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { TodosController } from './todos.controller'

@Module({
  providers: [TodosService, TodosDatabaseService],
  controllers: [TodosController],
})
export class TodosModule {}
