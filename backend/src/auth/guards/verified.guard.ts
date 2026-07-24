import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user }: { user: { emailVerifiedAt: Date | null } } = context
      .switchToHttp()
      .getRequest();

    return !!user.emailVerifiedAt;
  }
}
