import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // for using config from .env file
    }),
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/'),
    BookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
