import type { Body, Method, Request, Response, ServerRequest, Uri } from './message.js';

export type UriFactory = (uri: string) => Uri;

export type StreamFactory = (content: string) => Body;
export type StreamFromFileFactory = (filename: string) => Body;

/**
 * A request with protocol version `1.1`, no headers, an empty body and a signal of its own (never shared between
 * requests), a `Uri` gets used as given.
 */
export type RequestFactory = (method: Method, uri: string | Uri) => Request;

export type ServerRequestFactory = (method: Method, uri: string | Uri) => ServerRequest;

/**
 * A response with protocol version `1.1`, no headers and an empty body, the reason phrase falls back to the one of
 * `STATUS_CODES` from `node:http` (an empty string if unknown).
 */
export type ResponseFactory = (status: number, reasonPhrase?: string) => Response;
