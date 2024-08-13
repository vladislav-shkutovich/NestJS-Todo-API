import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator'
import { Types } from 'mongoose'

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsMongoId()
  userId: Types.ObjectId
}
