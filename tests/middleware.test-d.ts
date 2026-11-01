import { describe, expectTypeOf, test } from 'vitest';
import type { Handler } from '../src/handler.js';
import type { Response, ServerRequest } from '../src/message.js';
import type { Middleware } from '../src/middleware.js';

type RequestIdAttributes = { requestId: string };
type UserAttributes = RequestIdAttributes & { userId: string };

const addingMiddleware: Middleware<RequestIdAttributes, UserAttributes> = async (request, handler) =>
  handler({ ...request, attributes: { ...request.attributes, userId: 'user-1' } });

const requestIdMiddleware = async (
  request: ServerRequest<RequestIdAttributes>,
  handler: Handler,
): Promise<Response> => {
  expectTypeOf(request.attributes.requestId).toEqualTypeOf<string>();

  return handler(request);
};

const passingMiddleware: Middleware<RequestIdAttributes> = async (request, handler) => handler(request);

const notAddingMiddleware: Middleware<RequestIdAttributes, UserAttributes> = async (request, handler) =>
  // @ts-expect-error userId is missing
  handler(request);

describe('Middleware', () => {
  test('defaults to the same attributes for request and handler', () => {
    expectTypeOf<Middleware<UserAttributes>>().parameter(0).toEqualTypeOf<ServerRequest<UserAttributes>>();
    expectTypeOf<Middleware<UserAttributes>>().parameter(1).toEqualTypeOf<Handler<UserAttributes>>();
  });

  test('can add attributes', () => {
    expectTypeOf(addingMiddleware).parameter(0).toEqualTypeOf<ServerRequest<RequestIdAttributes>>();
    expectTypeOf(addingMiddleware).parameter(1).toEqualTypeOf<Handler<UserAttributes>>();
  });

  test('rejects a missing added attribute', () => {
    expectTypeOf(notAddingMiddleware).toBeFunction();
  });

  test('accepts a middleware expecting specific attributes', () => {
    const middleware: Middleware = requestIdMiddleware;
    const middlewares: Array<Middleware> = [requestIdMiddleware, addingMiddleware];

    expectTypeOf(middleware).toBeFunction();
    expectTypeOf(middlewares).toBeArray();
  });

  test('rejects a call with missing attributes', () => {
    const middleware: Middleware<RequestIdAttributes> = passingMiddleware;

    expectTypeOf<ServerRequest>().not.toExtend<Parameters<typeof middleware>[0]>();
    // @ts-expect-error requestId is missing
    void middleware({} as ServerRequest, async () => ({}) as Response);
  });
});
