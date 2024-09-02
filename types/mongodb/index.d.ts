import type { ChangeStream as MongodbChangeStream } from 'mongodb'

declare module 'mongodb' {
  interface ChangeStream<
    TSchema extends Document = Document,
    TChange extends Document = ChangeStreamDocument<TSchema>,
  > extends MongodbChangeStream<TSchema, TChange> {
    driverChangeStream: MongodbChangeStream<TSchema, TChange>
  }
}
