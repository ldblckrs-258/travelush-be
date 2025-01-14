import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('root', () => {
    it('should redirect to /health', (res) => {
      expect(appController.redirect(res)).toBeUndefined()
    })
  })
})
