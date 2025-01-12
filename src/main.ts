import { AppModule } from '@/app.module'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT)
  Logger.log(
    `Server running on http://localhost:${process.env.PORT}`,
    'Bootstrap',
  )
}
bootstrap()
