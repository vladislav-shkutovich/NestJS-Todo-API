import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { USER_MODEL } from 'src/common/constants/database.constants'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserDatabaseService } from './user.database.service'
import { UserSchema } from './schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL, schema: UserSchema }]),
  ],
  providers: [UserService, UserDatabaseService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
