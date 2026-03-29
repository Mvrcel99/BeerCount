import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Role } from '../../enums/role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';

const ADMIN_ACCESS_KEY = 'ADMIN_KEY_123';
const STUDENT_ACCESS_KEY = 'STUDENT_KEY_123';
const KURSSPRECHER_ACCESS_KEY = 'KURS_KEY_123';

const KEY_ROLE_MAP: Record<string, Role> = {
  [ADMIN_ACCESS_KEY]: Role.ADMIN,
  [STUDENT_ACCESS_KEY]: Role.STUDENT,
  [KURSSPRECHER_ACCESS_KEY]: Role.KURSSPRECHER,
};

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-access-key'] as string;

    if (!providedKey) {
      throw new UnauthorizedException('Access Key is missing');
    }

    const userRole = KEY_ROLE_MAP[providedKey];
    if (!userRole) {
      throw new ForbiddenException('Invalid Access Key');
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
