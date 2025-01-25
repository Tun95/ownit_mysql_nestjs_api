import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validateToken } from '../utils';
import { UserService } from '../services/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authorization.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET || 'somethingsecret';

    request['user'] = await validateToken(token, jwtSecret, this.userService);
    return true;
  }
}
