import { AppModule } from '@/app.module'
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  app.enableCors()

  await app.listen(process.env.PORT)
  Logger.log(
    `Server running on http://localhost:${process.env.PORT}`,
    'Bootstrap',
  )
}
bootstrap()
