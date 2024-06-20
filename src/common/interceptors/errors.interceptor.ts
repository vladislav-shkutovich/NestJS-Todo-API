import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { NotFoundError, ValidationError } from '../errors/errors'

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) =>
        throwError(() => {
          if (error instanceof NotFoundError) {
            return new HttpException(error.message, HttpStatus.NOT_FOUND)
          }

          if (error instanceof ValidationError) {
            return new HttpException(error.message, HttpStatus.BAD_REQUEST)
          }

          if (error instanceof HttpException) {
            return error
          }

          return new HttpException(
            'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          )
        }),
      ),
    )
  }
}
