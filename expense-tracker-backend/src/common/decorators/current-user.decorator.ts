import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Isse controller me @CurrentUser() likh kar seedha
// logged-in user ka data mil jayega (jwt.strategy.ts se aata hai)
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
