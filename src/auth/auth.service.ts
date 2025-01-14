import { comparePasswords, hashPassword } from '@/helpers/utils'
import { UserDocument } from '@/users/schemas/user.schema'
import { UsersService } from '@/users/users.service'
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<UserDocument> {
    if (await this.usersService.isEmailTaken(email)) {
      throw new ConflictException('Email is already taken')
    }

    const hashedPassword = await hashPassword(password)
    return await this.usersService.create(email, hashedPassword, name)
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByEmail(email)
    if (user && (await comparePasswords(password, user.password))) {
      const payload = { email: user.email, sub: user._id }
      const access_token = this.jwtService.sign(payload)
      const refresh_token = this.jwtService.sign(payload, {
        expiresIn: '7d',
      })
      return { access_token, refresh_token }
    }
    throw new UnauthorizedException('Invalid credentials')
  }
}
