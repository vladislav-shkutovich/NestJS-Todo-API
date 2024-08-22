import { IsOptional, IsString } from 'class-validator'

import type { Todo } from '../../todos/schemas/todos.schema'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string

  @IsString()
  @IsOptional()
  password?: string

  @IsOptional()
  todos?: Todo[]
}
