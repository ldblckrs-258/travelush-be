import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.usersService.login(
      loginDto.email,
      loginDto.password,
    )
    return tokens
  }

  @Get('list')
  async getUserList(@Query() query: string) {
    return this.usersService.getUserList(query)
  }
}
