import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TestMiddlewareMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    next(() => {
      console.log(req.user);
    });
  }
}
