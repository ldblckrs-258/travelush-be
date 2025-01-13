import { Logger } from '@nestjs/common'
import bcrypt from 'bcrypt'
const saltRounds = 10

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return bcrypt.hash(password, saltRounds)
  } catch (error) {
    Logger.error(error)
  }
}

export const comparePasswords = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return bcrypt.compare(password, hashedPassword)
  } catch (error) {
    Logger.error(error)
  }
}

export const generateRandomCode = (length: number = 6): string => {
  try {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length)
  } catch (error) {
    Logger.error(error)
  }
}
