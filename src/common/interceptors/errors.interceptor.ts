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
      catchError((error) => {
        switch (true) {
          case error instanceof NotFoundError:
            return throwError(
              () => new HttpException(error.message, HttpStatus.NOT_FOUND),
            )

          case error instanceof ValidationError:
            return throwError(
              () => new HttpException(error.message, HttpStatus.BAD_REQUEST),
            )

          case error instanceof HttpException:
            return throwError(() => error)

          default:
            return throwError(
              () =>
                new HttpException(
                  'Internal server error',
                  HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
        }
      }),
    )
  }
}
