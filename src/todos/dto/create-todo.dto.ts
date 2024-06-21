import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { Types } from 'mongoose'

export class CreateTodoDto {
  _id: Types.ObjectId

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string
}
