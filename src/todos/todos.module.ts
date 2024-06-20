import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TodosService } from './todos.service'
import { TodosDatabaseService } from './todos.database.service'
import { TodosController } from './todos.controller'
import { TodoSchema } from './schemas/todos.schema'
import { TODO_MODEL } from 'src/common/constants/database.constants'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TODO_MODEL, schema: TodoSchema }]),
  ],
  providers: [TodosService, TodosDatabaseService],
  controllers: [TodosController],
})
export class TodosModule {}
