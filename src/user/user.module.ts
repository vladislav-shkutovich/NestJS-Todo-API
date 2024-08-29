import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { USER_MODEL } from '../common/constants/database.constants'
import { TodosModule } from '../todos/todos.module'
import { UserSchema } from './schemas/user.schema'
import { UserChangeStreamDatabaseService } from './user.change-stream.database.service'
import { UserController } from './user.controller'
import { UserDatabaseService } from './user.database.service'
import { UserService } from './user.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL, schema: UserSchema }]),
    forwardRef(() => TodosModule),
  ],
  providers: [
    UserService,
    UserDatabaseService,
    UserChangeStreamDatabaseService,
  ],
  controllers: [UserController],
  exports: [UserService, UserChangeStreamDatabaseService],
})
export class UserModule {}
