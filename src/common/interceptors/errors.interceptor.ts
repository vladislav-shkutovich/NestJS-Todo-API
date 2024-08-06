import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { ValidationError, ConflictError, NotFoundError } from '../errors/errors'

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) =>
        throwError(() => {
          if (error instanceof NotFoundError) {
            return new NotFoundException(error.message)
          }

          if (error instanceof ConflictError) {
            return new ConflictException(error.message)
          }

          if (error instanceof ValidationError) {
            return new BadRequestException(error.message)
          }

          if (error instanceof HttpException) {
            return error
          }

          return new InternalServerErrorException()
        }),
      ),
    )
  }
}
