import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'

import { hashPassword } from '@/helpers/utils'
import fns from 'date-fns'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email })
    return user !== null
  }

  createCode(): { codeId: string; codeExpires: Date } {
    return {
      codeId: uuidv4(),
      codeExpires: fns.addMinutes(new Date(), 10),
    }
  }

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<UserDocument> {
    if (await this.isEmailTaken(email)) {
      throw new ConflictException('Email is already taken')
    }

    const hashedPassword = await hashPassword(password)
    const { codeId, codeExpires } = this.createCode()
    const createdUser = new this.userModel({
      name: name,
      email: email,
      password: hashedPassword,
      codeId: codeId,
      codeExpires: codeExpires,
    })
    createdUser.save()

    return createdUser
  }

  async refreshCode(email: string) {
    const user = await this.userModel.findOne({ email })

    if (!user) {
      throw new BadRequestException('This email is not registered')
    }

    if (user.isVerified) {
      throw new ConflictException('User is already verified')
    }

    // check if codeExpires more than 9 minutes, then return exception
    if (fns.isAfter(user.codeExpires, fns.addMinutes(new Date(), 9))) {
      throw new BadRequestException('You should not spam the code')
    }

    const { codeId, codeExpires } = this.createCode()
    user.codeId = codeId
    user.codeExpires = codeExpires
    user.save()
    return user
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

  async findById(id: string) {
    return await this.userModel.findById(id)
  }
}
