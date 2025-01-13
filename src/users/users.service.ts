import { comparePasswords, hashPassword } from '@/helpers/utils'
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'
import * as jwt from 'jsonwebtoken'
import { Model } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email })
    return user !== null
  }

  async register(createUserDto: CreateUserDto) {
    if (await this.isEmailTaken(createUserDto.email)) {
      throw new ConflictException('Email is already taken')
    }

    const hashedPassword = await hashPassword(createUserDto.password)
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    })
    createdUser.save()

    return createdUser.toObject()
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userModel.findOne({ email }).exec()
    if (user && (await comparePasswords(password, user.password))) {
      const accessToken = this.generateAccessToken(user)
      const refreshToken = this.generateRefreshToken(user)
      return { accessToken, refreshToken }
    }
    throw new UnauthorizedException('Invalid credentials')
  }

  private generateAccessToken(user: UserDocument): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '15m' },
    )
  }

  private generateRefreshToken(user: UserDocument): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      { expiresIn: '7d' },
    )
  }

  async getUserList(query: string) {
    const { filter, limit, sort } = aqp(query)

    const fixedLimit = limit || 10

    let page = 1
    if (filter.page) {
      page = filter.page
      delete filter.page
    }

    const totalItems = (
      await this.userModel.countDocuments().find(filter).exec()
    ).length
    const totalPages = Math.ceil(totalItems / fixedLimit)

    const skip = ((Math.min(page, totalPages) || 1) - 1) * fixedLimit
    const results = await this.userModel
      .find(filter)
      .limit(fixedLimit)
      .skip(skip)
      .sort(sort as any)
      .exec()

    return {
      totalItems,
      totalPages,
      results,
    }
  }
}
