import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TodosModule } from './todos/todos.module'

@Module({
  imports: [
    TodosModule,
    MongooseModule.forRoot(process.env.MONGOOSE_MODULE_DATABASE_URL),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
