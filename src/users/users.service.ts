import { comparePasswords, hashPassword } from '@/helpers/utils'
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'

import { Model } from 'mongoose'
import { RegisterDto } from '../auth/dto/register.dto'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email })
    return user !== null
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

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async create(
    email: string,
    password: string,
    name: string,
  ): Promise<UserDocument> {
    const createdUser = new this.userModel({ name, email, password })
    createdUser.save()
    return createdUser.toObject()
  }
}
