import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const isGraphQL = ctx.getType().toString() === 'graphql';
    let user;
    if (isGraphQL) {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const { req } = gqlCtx.getContext();
      user = req?.user;
    } else {
      const request = ctx.switchToHttp().getRequest();
      user = request?.user;
    }
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    if (data) return user[data];
    return user;
  },
);
