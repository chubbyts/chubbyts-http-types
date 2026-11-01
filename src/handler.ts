import type { Attributes, Response, ServerRequest } from './message.js';

/**
 * Declared as a method to get a bivariant request parameter: a handler expecting specific attributes, like
 * `(request: ServerRequest<{ name: string }>) => Promise<Response>`, is still assignable to `Handler` (like in v3).
 */
export type Handler<A extends Attributes = Attributes> = {
  handle(request: ServerRequest<A>): Promise<Response>;
}['handle'];
