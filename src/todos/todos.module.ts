import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import { UserSchema } from '../user/schemas/user.schema'
import { TodoSchema } from './schemas/todos.schema'
import { TodosChangeStreamDatabaseService } from './todos.change-stream.database.service'
import { TodosController } from './todos.controller'
import { TodosDatabaseService } from './todos.database.service'
import { TodosService } from './todos.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TODO_MODEL, schema: TodoSchema },
      { name: USER_MODEL, schema: UserSchema },
    ]),
  ],
  providers: [
    TodosService,
    TodosDatabaseService,
    TodosChangeStreamDatabaseService,
  ],
  controllers: [TodosController],
  exports: [TodosService],
})
export class TodosModule {}
