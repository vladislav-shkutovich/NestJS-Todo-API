import type { QueryOptions as MongooseQueryOptions } from 'mongoose'

import { OPERATIONS } from '../constants/common.constants'

export type QueryOptions = MongooseQueryOptions

export type OperationType = (typeof OPERATIONS)[keyof typeof OPERATIONS]

export type OperationCallback = (...payload: any) => Promise<void>
