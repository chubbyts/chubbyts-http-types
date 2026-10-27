import { Readable } from 'node:stream';
import { describe, expectTypeOf, test } from 'vitest';
import type { Query, Response, ServerRequest, Uri } from '../src/message.js';
import type {
  CookieOptions,
  MessageHelpers,
  RequestHelpers,
  ResponseHelpers,
  ServerRequestHelpers,
  UriHelpers,
} from '../src/message-helper.js';
import type { Middleware } from '../src/middleware.js';

declare const messageHelpers: MessageHelpers;
declare const requestHelpers: RequestHelpers;
declare const serverRequestHelpers: ServerRequestHelpers;
declare const responseHelpers: ResponseHelpers;
declare const uriHelpers: UriHelpers;
declare const request: ServerRequest<{ requestId: string }>;
declare const response: Response;

const createUserMiddleware = (
  helpers: ServerRequestHelpers,
): Middleware<{ requestId: string }, { requestId: string; userId: string }> => {
  return async (innerRequest, handler) =>
    handler(helpers.withAttribute(innerRequest, 'userId', helpers.getHeaderLine(innerRequest, 'x-user-id')));
};

describe('MessageHelpers', () => {
  test('with helpers keep the type of the message', () => {
    expectTypeOf(messageHelpers.withHeader(request, 'accept', 'application/json')).toEqualTypeOf<
      ServerRequest<{ requestId: string }>
    >();
    expectTypeOf(messageHelpers.withAddedHeader(request, 'accept', ['text/html'])).toEqualTypeOf<
      ServerRequest<{ requestId: string }>
    >();
    expectTypeOf(messageHelpers.withoutHeader(request, 'accept')).toEqualTypeOf<ServerRequest<{ requestId: string }>>();
    expectTypeOf(messageHelpers.withProtocolVersion(response, '2')).toEqualTypeOf<Response>();
    expectTypeOf(messageHelpers.withBody(request, Readable.from([]))).toEqualTypeOf<
      ServerRequest<{ requestId: string }>
    >();
  });
});

describe('RequestHelpers', () => {
  test('getQueryParams returns the parsed query', () => {
    expectTypeOf(requestHelpers.getQueryParams(request)).toEqualTypeOf<Query>();
  });

  test('withQueryParams keeps the type of the request', () => {
    expectTypeOf(requestHelpers.withQueryParams(request, { key: ['value'] })).toEqualTypeOf<
      ServerRequest<{ requestId: string }>
    >();
  });

  test('contains the message helpers', () => {
    expectTypeOf(requestHelpers).toExtend<MessageHelpers>();
  });

  test('with helpers keep the type of the request', () => {
    expectTypeOf(requestHelpers.withUri(request, request.uri)).toEqualTypeOf<ServerRequest<{ requestId: string }>>();
    expectTypeOf(requestHelpers.withSignal(request, AbortSignal.timeout(1000))).toEqualTypeOf<
      ServerRequest<{ requestId: string }>
    >();
    expectTypeOf(requestHelpers.withMethod(request, 'PROPFIND')).toEqualTypeOf<ServerRequest<{ requestId: string }>>();
  });
});

describe('ServerRequestHelpers', () => {
  test('getCookieParams returns the cookies', () => {
    expectTypeOf(serverRequestHelpers.getCookieParams(request)).toEqualTypeOf<Readonly<Record<string, string>>>();
  });

  test('contains the request and message helpers', () => {
    expectTypeOf(serverRequestHelpers).toExtend<RequestHelpers>();
    expectTypeOf(serverRequestHelpers).toExtend<MessageHelpers>();
  });

  test('withAttribute adds a typed attribute', () => {
    const withUser = serverRequestHelpers.withAttribute(request, 'userId', 'user-1');

    expectTypeOf(withUser.attributes.requestId).toEqualTypeOf<string>();
    expectTypeOf(withUser.attributes.userId).toEqualTypeOf<string>();
    expectTypeOf(withUser).toExtend<ServerRequest<{ requestId: string; userId: string }>>();
    expectTypeOf(withUser).toEqualTypeOf<
      ServerRequest<Omit<{ readonly requestId: string }, 'userId'> & { readonly userId: string }>
    >();
  });

  test('withAttribute replaces the type of an existing attribute', () => {
    expectTypeOf(
      serverRequestHelpers.withAttribute(request, 'requestId', 1).attributes.requestId,
    ).toEqualTypeOf<number>();
  });

  test('withoutAttribute removes a typed attribute', () => {
    const withUser = serverRequestHelpers.withAttribute(request, 'userId', 'user-1');
    const withoutRequestId = serverRequestHelpers.withoutAttribute(withUser, 'requestId');

    expectTypeOf(withoutRequestId.attributes).toEqualTypeOf<Omit<typeof withUser.attributes, 'requestId'>>();
    expectTypeOf(withoutRequestId.attributes).not.toHaveProperty('requestId');
    expectTypeOf(withoutRequestId.attributes.userId).toEqualTypeOf<string>();
  });

  test('withAttribute and withoutAttribute keep the type of a server request subtype', () => {
    const brandedRequest = request as typeof request & { readonly brand: 'branded' };

    const withUser = serverRequestHelpers.withAttribute(brandedRequest, 'userId', 'user-1');
    expectTypeOf(withUser.brand).toEqualTypeOf<'branded'>();
    expectTypeOf(withUser.attributes.userId).toEqualTypeOf<string>();

    const withoutRequestId = serverRequestHelpers.withoutAttribute(withUser, 'requestId');
    expectTypeOf(withoutRequestId.brand).toEqualTypeOf<'branded'>();
    expectTypeOf(withoutRequestId.attributes).not.toHaveProperty('requestId');
  });

  test('withAttribute with a non literal name widens the existing attributes', () => {
    const typedRequest = request as ServerRequest<{ requestId: string; count: number }>;
    const name = 'count' as string;

    const withValue = serverRequestHelpers.withAttribute(typedRequest, name, 'value');
    expectTypeOf(withValue.attributes.requestId).toEqualTypeOf<string>();
    expectTypeOf(withValue.attributes.count).toEqualTypeOf<number | string>();
    expectTypeOf(withValue).toEqualTypeOf<
      ServerRequest<{ readonly requestId: string; readonly count: number | string }>
    >();
  });

  test('withoutAttribute rejects an unknown attribute', () => {
    expectTypeOf(serverRequestHelpers.withoutAttribute(request, 'requestId').attributes).not.toHaveProperty(
      'requestId',
    );
    // @ts-expect-error unknown attribute
    serverRequestHelpers.withoutAttribute(request, 'userId');
  });

  test('middlewares get the helpers injected', () => {
    expectTypeOf(createUserMiddleware).toBeCallableWith(serverRequestHelpers);
  });
});

describe('ResponseHelpers', () => {
  test('withCookie and withoutCookie keep the type of the response', () => {
    expectTypeOf(
      responseHelpers.withCookie(response, 'session', 'abc', {
        path: '/',
        maxAge: 3600,
        secure: true,
        httpOnly: true,
        sameSite: 'Lax',
      }),
    ).toEqualTypeOf<Response>();
    expectTypeOf(responseHelpers.withoutCookie(response, 'session', { path: '/' })).toEqualTypeOf<Response>();
  });

  test('withoutCookie rejects maxAge and expires', () => {
    expectTypeOf<NonNullable<Parameters<ResponseHelpers['withoutCookie']>[2]>>().not.toHaveProperty('maxAge');
    expectTypeOf<NonNullable<Parameters<ResponseHelpers['withoutCookie']>[2]>>().not.toHaveProperty('expires');
    // @ts-expect-error maxAge is set by withoutCookie
    responseHelpers.withoutCookie(response, 'session', { maxAge: 10 });
  });

  test('sameSite is limited to its known values', () => {
    expectTypeOf<NonNullable<CookieOptions['sameSite']>>().toEqualTypeOf<'Strict' | 'Lax' | 'None'>();
    // @ts-expect-error unknown sameSite
    responseHelpers.withCookie(response, 'session', 'abc', { sameSite: 'lax' });
  });
  test('contains the message helpers', () => {
    expectTypeOf(responseHelpers).toExtend<MessageHelpers>();
    expectTypeOf(responseHelpers.withHeader(response, 'content-type', 'application/json')).toEqualTypeOf<Response>();
  });

  test('withStatus keeps the type of the response', () => {
    expectTypeOf(responseHelpers.withStatus(response, 404)).toEqualTypeOf<Response>();
  });
});

describe('UriHelpers', () => {
  test('uri helpers return a uri', () => {
    expectTypeOf(uriHelpers.withScheme(request.uri, 'https')).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.withUserInfo(request.uri, 'user', 'password')).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.withHost(request.uri, 'example.com')).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.withPort(request.uri, undefined)).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.withPath(request.uri, '/path')).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.withQuery(request.uri, 'key[]=value')).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.withFragment(request.uri, 'fragment')).toEqualTypeOf<Uri>();
    expectTypeOf(uriHelpers.toString(request.uri)).toEqualTypeOf<string>();
    expectTypeOf(uriHelpers.getAuthority(request.uri)).toEqualTypeOf<string>();
  });
});
