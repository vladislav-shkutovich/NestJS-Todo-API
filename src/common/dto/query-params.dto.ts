import { Transform, Type } from 'class-transformer'
import { IsOptional, IsNumber, IsObject } from 'class-validator'

export class QueryParamsDto {
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => (value ? JSON.parse(value) : undefined), {
    toClassOnly: true,
  })
  sort?: Record<string, number>

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number
}
