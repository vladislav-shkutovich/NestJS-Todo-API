import type { ChangeStream as MongodbChangeStream } from 'mongodb'

// TODO: - Improve global type for MongoDB change stream driver;
declare module 'mongodb' {
  interface ChangeStream extends MongodbChangeStream {
    driverChangeStream: ChangeStream<TSchema, TChange<TSchema>>
  }
}
