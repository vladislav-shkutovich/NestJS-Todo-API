import type { ChangeStream as MongodbChangeStream } from 'mongodb'

declare module 'mongodb' {
  interface ChangeStream extends MongodbChangeStream {
    driverChangeStream: ChangeStream<TSchema, TChange<TSchema>>
  }
}
