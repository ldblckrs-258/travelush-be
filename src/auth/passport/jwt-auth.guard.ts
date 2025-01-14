import { IS_PUBLIC_KEY } from '@/decorator/privacy.annotation'
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    return isPublic ? true : super.canActivate(context)
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Access token is invalid or expired')
      )
    }
    return user
  }
}
