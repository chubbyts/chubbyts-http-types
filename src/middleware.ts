import type { Attributes, Response, ServerRequest } from './message.js';
import type { Handler } from './handler.js';

/**
 * Declared as a method to get bivariant parameters: a middleware expecting specific attributes, like
 * `(request: ServerRequest<{ requestId: string }>, handler: Handler) => Promise<Response>`, is still assignable to
 * `Middleware` (like in v3).
 */
export type Middleware<IA extends Attributes = Attributes, OA extends Attributes = IA> = {
  process(request: ServerRequest<IA>, handler: Handler<OA>): Promise<Response>;
}['process'];
