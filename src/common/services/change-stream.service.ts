import { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Model } from 'mongoose'
import type {
  ChangeStream,
  ResumeToken,
  ChangeStreamOptions,
  ChangeStreamDocument,
} from 'mongodb'

export abstract class ChangeStreamService<T>
  implements OnModuleInit, OnModuleDestroy
{
  private changeStream: ChangeStream
  private resumeToken: ResumeToken

  constructor(
    protected readonly model: Model<T>,
    protected readonly pipeline: Array<Record<string, unknown>>,
  ) {}

  async onModuleInit() {
    this.addChangeStreamListener()
  }

  async onModuleDestroy() {
    this.removeChangeStreamListener()
  }

  private addChangeStreamListener() {
    const changeStreamOptions: ChangeStreamOptions = this.resumeToken
      ? { startAfter: this.resumeToken }
      : {}

    this.changeStream = this.model.watch(this.pipeline, changeStreamOptions)

    this.changeStream.on('change', async (changeStreamDoc) => {
      this.resumeToken = changeStreamDoc._id

      await this.handleChange(changeStreamDoc)
    })
  }

  private removeChangeStreamListener() {
    this.changeStream.close()
  }

  protected abstract handleChange(
    changeStreamDoc: ChangeStreamDocument,
  ): Promise<void>
}
