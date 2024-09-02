import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import type { ChangeStream, ChangeStreamDeleteDocument } from 'mongodb'

import { USER_MODEL } from '../common/constants/database.constants'
import type { User } from './schemas/user.schema'

@Injectable()
export class UserChangeStreamDatabaseService {
  private changeStreamOnDelete?: ChangeStream<
    User,
    ChangeStreamDeleteDocument<User>
  >

  constructor(
    @InjectModel(USER_MODEL) private readonly userModel: Model<User>,
  ) {}

  async *subscribeOnUserDelete(): AsyncGenerator<Types.ObjectId> {
    if (!this.changeStreamOnDelete) {
      this.changeStreamOnDelete = this.userModel.watch([
        {
          $match: {
            operationType: 'delete',
          },
        },
      ])
    }

    for await (const changeStreamDoc of this.changeStreamOnDelete
      .driverChangeStream) {
      yield changeStreamDoc.documentKey._id
    }

    this.changeStreamOnDelete.close()
  }
}
