import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator'

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsMongoId()
  userId: string
}
