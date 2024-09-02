import { IsMongoId } from 'class-validator'
import { Types } from 'mongoose'

// TODO: to be discussed at the same time with query params DTO validation
// topics:
// - Mongoose Types.ObjectId and ObjectId and MongoDB ObjectId differences
// - Transformation from string into ObjectId (validation issues)
export class IdParamDto {
  @IsMongoId()
  id: Types.ObjectId
}
