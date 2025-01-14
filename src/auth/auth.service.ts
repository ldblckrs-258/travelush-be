import { comparePasswords } from '@/helpers/utils'
import { UserDocument } from '@/users/schemas/user.schema'
import { UsersService } from '@/users/users.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async login(user: UserDocument): Promise<any> {
    const payload = { email: user.email, sub: user._id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email)
    if (user) {
      if (await comparePasswords(password, user.password)) {
        return user
      } else {
        throw new UnauthorizedException('Password is incorrect')
      }
    } else {
      throw new UnauthorizedException('This email is not registered')
    }
  }
}
