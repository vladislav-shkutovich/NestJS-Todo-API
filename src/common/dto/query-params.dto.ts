import { Transform, Type } from 'class-transformer'
import { IsNumber, IsObject, IsOptional } from 'class-validator'
import type { Todo } from '../../todos/schemas/todos.schema'
import type { User } from '../../user/schemas/user.schema'

// URL query params usage example: ?sort=updatedAt:desc
// Code query params usage example: sort: { updatedAt: 'desc' }
export class QueryParamsDto<T extends User | Todo> {
  @IsOptional()
  @IsObject()
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        const [key, order] = value.split(':')
        return { [key]: order }
      }
      return value
    },
    { toClassOnly: true },
  )
  sort?: { [K in keyof T]?: 'asc' | 'desc' }

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number
}
