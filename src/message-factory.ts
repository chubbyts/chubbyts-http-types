import type { Body, Method, Request, Response, ServerRequest, Uri } from './message.js';

export type UriFactory = (uri: string) => Uri;

export type BodyFactory = (content: string) => Body;
export type BodyFromFileFactory = (filename: string) => Body;

/** @deprecated use `BodyFactory`, the body is not a stream anymore */
export type StreamFactory = BodyFactory;
/** @deprecated use `BodyFromFileFactory`, the body is not a stream anymore */
export type StreamFromFileFactory = BodyFromFileFactory;

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
