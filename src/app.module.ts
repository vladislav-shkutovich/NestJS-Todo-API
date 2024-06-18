import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TodosModule } from './todos/todos.module'

// TODO: move secters into .env
@Module({
  imports: [
    TodosModule,
    MongooseModule.forRoot(
      'mongodb+srv://vladislav_shkutovich:1453130517b!@todoapi.7ofugp8.mongodb.net/?retryWrites=true&w=majority&appName=TodoAPI',
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
