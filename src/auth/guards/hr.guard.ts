
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class HrGuard extends JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const canActivate = super.canActivate(context);
    if (!canActivate) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.isHr) {
      throw new ForbiddenException('HR access required');
    }

    return true;
  }
}
