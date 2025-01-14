import { AppService } from '@/app.service'
import { Controller, Get, Res } from '@nestjs/common'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // getHello(): string {
  //   return this.appService.getHello()
  // }
  redirect(@Res() res: any) {
    res.redirect('/health')
  }
}
