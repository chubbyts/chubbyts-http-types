import type { Attributes, Response, ServerRequest } from './message.js';
import type { Handler } from './handler.js';

export type Middleware<IA extends Attributes = Attributes, OA extends Attributes = IA> = (
  request: ServerRequest<IA>,
  handler: Handler<OA>,
) => Promise<Response>;
