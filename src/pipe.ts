import type { Attributes, ServerRequest } from './message.js';
import type { Handler } from './handler.js';
import type { Middleware } from './middleware.js';

export const pipe =
  <A extends Attributes>(middlewares: ReadonlyArray<Middleware<A>>): Middleware<A> =>
  async (request: ServerRequest<A>, handler: Handler<A>) =>
    middlewares.reduceRight<Handler<A>>(
      (next, middleware) => (innerRequest) => middleware(innerRequest, next),
      handler,
    )(request);
