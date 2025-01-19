import { comparePasswords } from '@/helpers/utils'
import { UserDocument } from '@/users/schemas/user.schema'
import { UsersService } from '@/users/users.service'
import { MailerService } from '@nestjs-modules/mailer'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { isValidObjectId, Types } from 'mongoose'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async login(user: UserDocument): Promise<any> {
    const payload = { email: user.email, sub: user._id }
    return {
      access_token: this.jwtService.sign(payload),
      ...user.toJSON(),
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email)
    if (user) {
      if (await comparePasswords(password, user.password)) {
        if (!user.isVerified) {
          throw new ForbiddenException('Account is not verified')
        }
        return user
      } else {
        throw new BadRequestException('Password is incorrect')
      }
    } else {
      throw new BadRequestException('This email is not registered')
    }
  }

  async verifyAccount(userId: string, codeId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user id')
    }

    const user = await this.usersService.findById(userId)
    if (user.codeId === codeId) {
      if (user.codeExpires < new Date()) {
        throw new BadRequestException('Verification code is expired')
      }
      user.isVerified = true
      user.save()
      return true
    } else {
      throw new BadRequestException('Invalid verification code')
    }
  }

  sendVerificationEmail(
    _id: Types.ObjectId,
    email: string,
    name: string,
    codeId: string,
  ) {
    const webUrl =
      this.configService.get<string>('WEB_URL') ||
      `http://localhost:${this.configService.get<string>('FE_PORT')}`

    this.mailerService.sendMail({
      to: email,
      subject: 'Active your account at Travelush',
      template: 'register',
      context: {
        name: name,
        URL: `${webUrl}/active/confirm?id=${_id}&code=${codeId}`,
      },
    })
  }
}
