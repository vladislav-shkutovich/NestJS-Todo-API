import { IsMongoId } from 'class-validator'

export class IdParamDto {
  @IsMongoId()
  // TODO: - Transform string into ObjectId in commonly used IdParamDto and update related code (lot of conversions);
  // @Transform()
  id: string
}
