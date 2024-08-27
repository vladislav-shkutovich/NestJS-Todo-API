import type { QueryOptions as MongooseQueryOptions } from 'mongoose'

// TODO: - Don't rely on Mongoose in all application types (update all query types code);
export type QueryOptions = MongooseQueryOptions
