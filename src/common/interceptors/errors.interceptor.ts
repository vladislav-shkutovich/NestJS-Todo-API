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
import { NotFoundError } from '../errors/errors'

// TODO: discuss it and make decision what to use: exception filters separately or this interceptor with custom error classes (a problem with auth error handling: console - ok, actual response - 500 only from `handlRequest` guard)
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) =>
        throwError(() => {
          if (error instanceof NotFoundError) {
            return new HttpException(error.message, HttpStatus.NOT_FOUND)
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
