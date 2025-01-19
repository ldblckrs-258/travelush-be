import { ResponseMessage } from '@/decorator/format.annotation'
import { Public } from '@/decorator/privacy.annotation'
import { UsersService } from '@/users/users.service'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ActiveDto } from './dto/active.dto'
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

  @Public()
  @ResponseMessage('Code has been sent to your email')
  @Get('refresh-code')
  async resendCode(@Query() query: any) {
    const email = query.email
    if (!email) {
      throw new BadRequestException('Email is required')
    }
    const user = await this.usersService.refreshCode(email)
    if (user) {
      this.authService.sendVerificationEmail(
        user._id,
        user.email,
        user.name,
        user.codeId,
      )
    }
  }

  @Public()
  @ResponseMessage('Account has been verified successfully')
  @Post('active')
  async verifyAccount(@Body() activeDto: ActiveDto) {
    await this.authService.verifyAccount(activeDto.id, activeDto.code)
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
