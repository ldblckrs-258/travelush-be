import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  user?: any
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
    } catch (err) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
