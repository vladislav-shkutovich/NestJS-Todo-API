import { Injectable, PipeTransform } from '@nestjs/common'

import { ConflictError } from '../../common/errors/errors'
import { UserDatabaseService } from '../user.database.service'
import type { CreateUserDto } from '../dto/create-user.dto'

@Injectable()
export class UsernameValidationPipe implements PipeTransform {
  constructor(private readonly userDatabaseService: UserDatabaseService) {}

  async transform(createUserDto: CreateUserDto): Promise<CreateUserDto> {
    const isDuplicate = await this.userDatabaseService.getIsUserExist(
      createUserDto.username,
    )

    if (isDuplicate) {
      throw new ConflictError(
        `User with username ${createUserDto.username} already exists`,
      )
    }

    return createUserDto
  }
}
