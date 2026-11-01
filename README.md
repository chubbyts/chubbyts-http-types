# chubbyts-http-types

[![CI](https://github.com/chubbyts/chubbyts-http-types/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/chubbyts/chubbyts-http-types/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/chubbyts/chubbyts-http-types/badge.svg?branch=master)](https://coveralls.io/github/chubbyts/chubbyts-http-types?branch=master)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fchubbyts%2Fchubbyts-http-types%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyts/chubbyts-http-types/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyts/chubbyts-http-types.svg)](https://www.npmjs.com/package/@chubbyts/chubbyts-http-types)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-types&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-types)

## Description

TypeScript types for HTTP messages, handlers and middlewares, inspired by [PSR-7][2], [PSR-15][3] and [PSR-17][4].

A contract only: types (plus `pipe`), no implementation. Frameworks, routers and middlewares depend on it and stay
interchangeable, any implementation of the factories and helpers creates and changes the messages. A body is an
[`AsyncIterable<Uint8Array>`][5], so Node.js streams and web `ReadableStream`s need no conversion.

| Module            | Exports                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `message`         | `Uri`, `Query`, `Headers`, `Body`, `Message`, `Method`, `Request`, `Attributes`, `ServerRequest<A>`, `Response`             |
| `message-factory` | `UriFactory`, `BodyFactory`, `BodyFromFileFactory`, `RequestFactory`, `ServerRequestFactory`, `ResponseFactory`             |
| `message-helper`  | `HeaderValue`, `MessageHelpers`, `RequestHelpers`, `ServerRequestHelpers`, `ResponseHelpers`, `UriHelpers`, `CookieOptions` |
| `handler`         | `Handler<A>`: `(request: ServerRequest<A>) => Promise<Response>`                                                            |
| `middleware`      | `Middleware<I, O = I>`: `(request: ServerRequest<I>, handler: Handler<O>) => Promise<Response>`                             |

`A`, `I` and `O` extend and default to `Attributes` (`Record<string, unknown>`).

## Requirements

- node: 22

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-http-types][1].

```sh
npm i @chubbyts/chubbyts-http-types@^4.1.0
```

## Usage

### Messages

```ts
import { Readable } from 'node:stream';
import type { ServerRequest } from '@chubbyts/chubbyts-http-types/message';

// GET https://user:password@localhost:10443/api?key1=value1&key2[]=value2&key3[key31]=value3#fragment
const request: ServerRequest = {
  method: 'GET',
  uri: {
    scheme: 'https',
    userInfo: 'user:password',
    host: 'localhost',
    port: 10443,
    path: '/api',
    query: 'key1=value1&key2[]=value2&key3[key31]=value3',
    fragment: 'fragment',
  },
  protocolVersion: '1.1',
  headers: { accept: ['application/json'] },
  body: Readable.from([]),
  signal: new AbortController().signal,
  attributes: {},
};
```

- `method`: the known methods get autocompleted, any extension method (`PROPFIND`) is allowed.
- `uri.port`: `undefined` without an explicit port. `uri.query`: raw and percent-encoded, without `?`.
- `headers`: lowercase names, each with a list of values.
- `body`: read once by iterating it (e.g. `text(body)` from `node:stream/consumers`), the chunks are bytes, never
  objects.
- `signal`: aborted when the request is no longer needed (e.g. the client disconnected). The server bridge owns it,
  handlers pass it on, e.g. `fetch(url, { signal: request.signal })`.
- `attributes`: values derived from the request (route parameters, the user), see [Typed attributes](#typed-attributes).

A `Request` is the same without `attributes`, a `Response` has `status`, `reasonPhrase`, `protocolVersion`, `headers`
and `body`.

### Factories

| Type                   | Signature                                               |
| ---------------------- | ------------------------------------------------------- |
| `UriFactory`           | `(uri: string) => Uri`                                  |
| `BodyFactory`          | `(content: string) => Body`                             |
| `BodyFromFileFactory`  | `(filename: string) => Body`                            |
| `RequestFactory`       | `(method: Method, uri: string \| Uri) => Request`       |
| `ServerRequestFactory` | `(method: Method, uri: string \| Uri) => ServerRequest` |
| `ResponseFactory`      | `(status: number, reasonPhrase?: string) => Response`   |

Created messages have the protocol version `1.1`, no headers and an empty body. Each request gets a signal of its own
(a shared one would pile up the listeners), a given `Uri` is used as is, a server request starts without attributes. The
reason phrase falls back to [`STATUS_CODES`][6] (an empty string if unknown).

### Helpers

The helpers read and change messages and uris, split like the PSR-7 interfaces. Every implementation has to follow
these rules, so middlewares work with whichever gets injected:

- header names are case-insensitive and stored lowercase, a name has to be a token ([RFC 9110 5.1][7]), a value must
  not contain CR, LF or NUL, otherwise the `with*` helpers throw
- the `with*` helpers return a new message or uri, the given one stays unchanged
- a query gets parsed with nested (`key[sub]=value`, `key[]=value`) and repeated keys into objects and arrays, `+` and
  percent-encodings decoded, `__proto__` never changes the prototype, the limits (depth, array size, parameters) are up
  to the implementation
- query params get serialized with indexed keys (`key[sub]=value`, `key[0]=value`), percent-encoded (RFC 3986, space as
  `%20`), empty arrays and objects dropped, so parsing them returns them again
- the port of a uri is `undefined` if it is the standard one of its scheme (80 for http, 443 for https)

`MessageHelpers` (PSR-7 `MessageInterface`):

| Helper                | Signature                                  | Rule                                                                        |
| --------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| `getHeader`           | `(message, name) => ReadonlyArray<string>` | empty array if missing                                                      |
| `getHeaderLine`       | `(message, name) => string`                | values joined with `', '`, empty string if missing, throws for `set-cookie` |
| `hasHeader`           | `(message, name) => boolean`               |                                                                             |
| `withHeader`          | `(message, name, value) => message`        | replaces the values                                                         |
| `withAddedHeader`     | `(message, name, value) => message`        | appends to the existing values                                              |
| `withoutHeader`       | `(message, name) => message`               |                                                                             |
| `withProtocolVersion` | `(message, protocolVersion) => message`    | throws for other than `1.0`, `1.1`, `2` or `3`                              |
| `withBody`            | `(message, body) => message`               |                                                                             |

`RequestHelpers` (PSR-7 `RequestInterface`), including the `MessageHelpers`:

| Helper             | Signature                                  | Rule                                                                             |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `withMethod`       | `(request, method) => request`             | throws if not a token, case-sensitive                                            |
| `getRequestTarget` | `(request) => string`                      | origin-form: path (`/` if empty) and query                                       |
| `withUri`          | `(request, uri, preserveHost?) => request` | sets the `host` header, unless the uri has none or `preserveHost` and one exists |
| `withSignal`       | `(request, signal) => request`             | e.g. `AbortSignal.any([request.signal, AbortSignal.timeout(ms)])`                |
| `getQueryParams`   | `(request) => Query`                       | parses `uri.query`                                                               |
| `withQueryParams`  | `(request, queryParams) => request`        | replaces `uri.query`                                                             |

`ServerRequestHelpers` (PSR-7 `ServerRequestInterface`), including the `RequestHelpers`:

| Helper             | Signature                             | Rule                                                              |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------- |
| `withAttribute`    | `(request, name, value) => request`   | adds or replaces the attribute, including its type (\*)           |
| `withoutAttribute` | `(request, name) => request`          | removes the attribute, including its type                         |
| `getCookieParams`  | `(request) => Record<string, string>` | values as sent, surrounding quotes removed, first occurrence wins |

(\*) With a name only known at runtime (`string`), any attribute could get replaced, so their types widen to include
the type of the value.

`ResponseHelpers` (PSR-7 `ResponseInterface`), including the `MessageHelpers`:

| Helper          | Signature                                       | Rule                                                               |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| `withStatus`    | `(response, status, reasonPhrase?) => response` | throws outside 100-599, reason phrase falls back to `STATUS_CODES` |
| `withCookie`    | `(response, name, value, options?) => response` | appends a `set-cookie` header                                      |
| `withoutCookie` | `(response, name, options?) => response`        | appends a `set-cookie` header expiring the cookie                  |

`UriHelpers` (PSR-7 `UriInterface`):

| Helper         | Signature                       | Rule                                                             |
| -------------- | ------------------------------- | ---------------------------------------------------------------- |
| `getAuthority` | `(uri) => string`               | `[user-info@]host[:port]`, empty string without host             |
| `toString`     | `(uri) => string`               | `//` and the authority only with a host                          |
| `withScheme`   | `(uri, scheme) => uri`          | lowercased, throws if invalid, empty allowed                     |
| `withUserInfo` | `(uri, user, password?) => uri` | percent-encoded, joined with `:`                                 |
| `withHost`     | `(uri, host) => uri`            | lowercased                                                       |
| `withPort`     | `(uri, port) => uri`            | throws outside 1-65535, `undefined` removes it                   |
| `withPath`     | `(uri, path) => uri`            | percent-encodes not allowed characters, keeps existing encodings |
| `withQuery`    | `(uri, query) => uri`           | without `?`, percent-encodes like `withPath`                     |
| `withFragment` | `(uri, fragment) => uri`        | without `#`, percent-encodes like `withPath`                     |

The cookie helpers follow [RFC 6265][8] (PSR-7 has no cookie support):

- a name has to be a token, a value consists of cookie-octets, optionally within double quotes, and gets neither
  encoded nor decoded
- path and domain must not contain `;` or control characters, an invalid `maxAge` or `expires` throws
- `sameSite: 'None'` and `partitioned` require `secure`, a `__Secure-` prefix requires `secure`, a `__Host-` prefix
  `secure`, the path `/` and no domain
- attributes get serialized in the order `Path`, `Domain`, `Max-Age`, `Expires`, `Secure`, `HttpOnly`, `SameSite`,
  `Partitioned`
- `withoutCookie` sets an empty value, `Max-Age=0` and an `Expires` within 1970, path and domain have to match the ones
  the cookie got set with

### Handler

A handler turns a server request into a response, its dependencies get injected:

```ts
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { BodyFactory, ResponseFactory } from '@chubbyts/chubbyts-http-types/message-factory';
import type { ResponseHelpers } from '@chubbyts/chubbyts-http-types/message-helper';

export const createPingHandler = (
  responseFactory: ResponseFactory,
  bodyFactory: BodyFactory,
  responseHelpers: ResponseHelpers,
): Handler => {
  return async () => {
    const response = responseHelpers.withBody(
      responseFactory(200),
      bodyFactory(JSON.stringify({ datetime: new Date().toISOString() })),
    );

    return responseHelpers.withHeader(response, 'content-type', 'application/json');
  };
};
```

### Middleware

A middleware changes the request before and the response after the next handler, or responds on its own:

```ts
import type { Attributes } from '@chubbyts/chubbyts-http-types/message';
import type { ResponseHelpers, ServerRequestHelpers } from '@chubbyts/chubbyts-http-types/message-helper';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';

export const createRequestIdMiddleware = (
  serverRequestHelpers: ServerRequestHelpers,
  responseHelpers: ResponseHelpers,
): Middleware<Attributes, { requestId: string }> => {
  return async (request, handler) => {
    const requestId = crypto.randomUUID();

    const response = await handler(serverRequestHelpers.withAttribute(request, 'requestId', requestId));

    return responseHelpers.withHeader(response, 'x-request-id', requestId);
  };
};
```

### Pipe

`pipe` composes middlewares into one, the first being the outermost:

```ts
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import { pipe } from '@chubbyts/chubbyts-http-types/pipe';

declare const handler: Handler;
declare const middlewares: Array<Middleware>;

const middleware: Middleware = pipe(middlewares);

export const app: Handler = (request) => middleware(request, handler);
```

### Typed attributes

A handler or middleware relying on attributes set earlier (by a router or an authentication) declares them, one that
adds attributes declares the ones it receives and the ones it passes on as `Middleware<I, O>`:

```ts
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { ResponseFactory } from '@chubbyts/chubbyts-http-types/message-factory';
import type { ResponseHelpers, ServerRequestHelpers } from '@chubbyts/chubbyts-http-types/message-helper';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';

type RequestIdAttributes = { requestId: string };
type UserAttributes = RequestIdAttributes & { userId: string };

export const createAuthenticationMiddleware = (
  serverRequestHelpers: ServerRequestHelpers,
  resolveUserId: (authorization: string) => Promise<string>,
): Middleware<RequestIdAttributes, UserAttributes> => {
  return async (request, handler) => {
    const userId = await resolveUserId(serverRequestHelpers.getHeaderLine(request, 'authorization'));

    return handler(serverRequestHelpers.withAttribute(request, 'userId', userId));
  };
};

export const createUserHandler =
  (responseFactory: ResponseFactory, responseHelpers: ResponseHelpers): Handler<UserAttributes> =>
  async (request) =>
    responseHelpers.withHeader(responseFactory(204), 'x-user-id', request.attributes.userId);
```

`pipe` only composes middlewares sharing the same attributes (`Middleware<A>`). With
`m1: Middleware<RequestIdAttributes, UserAttributes>` and `m2: Middleware<UserAttributes, PingAttributes>`,
`pipe([m1, m2])` compiles to a `Middleware<UserAttributes>`: it requires the `userId` upfront and hides the `ping`.
Chain such middlewares by hand:

```ts
const app: Handler<RequestIdAttributes> = (request) => m1(request, (userRequest) => m2(userRequest, handler));
```

## Upgrade from 3.x

| 3.x                                                              | 4.x                                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| node >= 18                                                       | node >= 22                                                                                            |
| `import … from '@chubbyts/chubbyts-http-types/dist/message'`     | `import … from '@chubbyts/chubbyts-http-types/message'` (without `dist/`)                             |
| `uri.schema`                                                     | `uri.scheme` (like PSR-7 `getScheme()`)                                                               |
| `statusMap.get(status)`                                          | `STATUS_CODES[status]` from `node:http`                                                               |
| mutable messages                                                 | all properties `readonly`, e.g. `withAttribute(request, 'userId', 'user-1')` instead of an assignment |
| `Method` limited to `CONNECT`, `DELETE`, `GET`, … `TRACE`        | any method, the known ones get autocompleted                                                          |
| `Query` arrays contain only nested queries                       | `Query` arrays contain strings and nested queries (`key[]=value`)                                     |
| `uri.query` parsed (`Query`)                                     | `uri.query` raw string, use `requestHelpers.getQueryParams` and `withQueryParams`                     |
| `body` is a `Duplex`, a handler writes into `response.body`      | `body` is an `AsyncIterable<Uint8Array>`, a handler sets it with `withBody(response, bodyFactory(…))` |
| `StreamFromResourceFactory`                                      | removed, a Node.js stream already is a `Body`                                                         |
| `StreamFactory`, `StreamFromFileFactory`                         | `BodyFactory`, `BodyFromFileFactory` (the old names are deprecated aliases)                           |
| no way to notice a disconnected client                           | `request.signal`, aborted when the request is no longer needed                                        |
| `ServerRequest`, `Handler`, `Middleware` with untyped attributes | `ServerRequest<A>`, `Handler<A>`, `Middleware<I, O>` with typed attributes                            |
| -                                                                | new: `Headers`, `Body`, `Attributes`, the helper types and `pipe`                                     |

## Copyright

2026 Dominik Zogg

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[2]: https://www.php-fig.org/psr/psr-7
[3]: https://www.php-fig.org/psr/psr-15
[4]: https://www.php-fig.org/psr/psr-17
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator
[6]: https://nodejs.org/api/http.html#httpstatus_codes
[7]: https://www.rfc-editor.org/rfc/rfc9110#section-5.1
[8]: https://www.rfc-editor.org/rfc/rfc6265
