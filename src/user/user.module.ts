import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { USER_MODEL } from '../common/constants/database.constants'
import { UserSchema } from './schemas/user.schema'
import { UserController } from './user.controller'
import { UserDatabaseService } from './user.database.service'
import { UserService } from './user.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL, schema: UserSchema }]),
  ],
  providers: [UserService, UserDatabaseService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
