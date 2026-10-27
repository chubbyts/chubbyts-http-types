import type { Attributes, Response, ServerRequest } from './message.js';

export type Handler<A extends Attributes = Attributes> = (request: ServerRequest<A>) => Promise<Response>;
