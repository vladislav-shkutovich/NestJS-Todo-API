import { IsMongoId } from 'class-validator'

export class IdParamDto {
  @IsMongoId()
  // TODO: - Transform string into ObjectId in commonly used IdParamDto and update related code (lot of conversions);
  // ? To be discussed.
  // @Transform(({ value }) =>
  //   typeof value === 'string' ? new Types.ObjectId(value) : value,
  // )
  // id: Types.ObjectId
  id: string
}
