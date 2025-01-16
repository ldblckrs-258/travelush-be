import { ResponseMessage } from '@/decorator/format.annotation'
import { Public } from '@/decorator/privacy.annotation'
import { UsersService } from '@/users/users.service'
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LocalAuthGuard } from './passport/local-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    )

    if (user) {
      this.authService.sendVerificationEmail(
        user._id,
        user.email,
        user.name,
        user.codeId,
      )
    }
    return user
  }

  @Get('refresh-code')
  async resendCode(@Request() req: any) {
    const user = await this.usersService.refreshCode(req.user._id)
    if (user) {
      this.authService.sendVerificationEmail(
        user._id,
        user.email,
        user.name,
        user.codeId,
      )
    }

    return { message: 'Verification code has been sent successfully' }
  }

  @Public()
  @Get('active/:userId')
  async verifyAccount(@Request() req: any) {
    await this.authService.verifyAccount(req.params.userId, req.query.codeId)

    return { message: 'Account has been verified successfully' }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Login successfully')
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
