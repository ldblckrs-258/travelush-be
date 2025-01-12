import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import * as Joi from 'joi'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      validationOptions: {
        abortEarly: false,
      },
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string(),
        PORT: Joi.number().default(8080),
      }),
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
