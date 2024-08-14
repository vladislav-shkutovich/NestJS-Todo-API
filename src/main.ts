import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(new ErrorsInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  )
  await app.listen(3000)
}

bootstrap()
