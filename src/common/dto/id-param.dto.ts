import { IsMongoId } from 'class-validator'
import { Types } from 'mongoose'

export class IdParamDto {
  @IsMongoId()
  id: Types.ObjectId
}
