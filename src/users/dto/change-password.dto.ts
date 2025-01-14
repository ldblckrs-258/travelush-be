import { ObjectId } from 'mongoose'

export class ChangePasswordDto {
  _id: ObjectId
  oldPassword: string
  newPassword: string
  code: string
}
