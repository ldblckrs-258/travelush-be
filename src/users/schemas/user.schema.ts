import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.password
      delete ret.__v
      delete ret.codeId
      delete ret.codeExpires
      delete ret.createdAt
      delete ret.updatedAt
    },
  },
  toObject: {
    transform: (_, ret) => {
      delete ret.password
      delete ret.__v
      delete ret.codeId
      delete ret.codeExpires
      delete ret.createdAt
      delete ret.updatedAt
    },
  },
})
export class User {
  @Prop()
  name: string

  @Prop()
  email: string

  @Prop()
  password: string

  @Prop({ default: '/png/avatar.png' })
  avatar: string

  @Prop({ default: UserRole.USER })
  role: string

  @Prop({ default: false })
  isVerified: boolean

  @Prop()
  codeId: string

  @Prop()
  codeExpires: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
