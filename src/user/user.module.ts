import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { TODO_MODEL, USER_MODEL } from '../common/constants/database.constants'
import { TodoSchema } from '../todos/schemas/todos.schema'
import { TodosModule } from '../todos/todos.module'
import { UserSchema } from './schemas/user.schema'
import { UserChangeStreamDatabaseService } from './user.change-stream.database.service'
import { UserController } from './user.controller'
import { UserDatabaseService } from './user.database.service'
import { UserService } from './user.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_MODEL, schema: UserSchema },
      { name: TODO_MODEL, schema: TodoSchema },
    ]),
    TodosModule,
  ],
  providers: [
    UserService,
    UserDatabaseService,
    UserChangeStreamDatabaseService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
