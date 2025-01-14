import { Public } from '@/decorator/privacy.annotation'
import { UsersService } from '@/users/users.service'
import { MailerService } from '@nestjs-modules/mailer'
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LocalAuthGuard } from './passport/local-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const webUrl =
      this.configService.get<string>('WEB_URL') ||
      `http://localhost:${this.configService.get<string>('FE_PORT')}`
    const user = await this.usersService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    )

    if (user) {
      this.mailerService.sendMail({
        to: user.email,
        subject: 'Active your account at Travelush',
        template: 'register',
        context: {
          name: user.name,
          URL: `${webUrl}/active/${user._id}?code=${user.codeId}`,
        },
      })
    }
    return user
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user)
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user._id)

    if (!user) {
      throw new UnauthorizedException('User not found. Please login again.')
    }

    return user
  }
}
