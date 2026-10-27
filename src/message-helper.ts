import type { Attributes, Body, Message, Method, Query, Request, Response, ServerRequest, Uri } from './message.js';

export type HeaderValue = string | ReadonlyArray<string>;

export type CookieOptions = {
  readonly path?: string;
  readonly domain?: string;
  /** In seconds, has to be an integer, zero or less expires the cookie immediately. */
  readonly maxAge?: number;
  readonly expires?: Date;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  /** `None` requires `secure`. */
  readonly sameSite?: 'Strict' | 'Lax' | 'None';
  /** Requires `secure` (CHIPS). */
  readonly partitioned?: boolean;
};

/**
 * Helpers to read and change messages, split like the PSR-7 interfaces. Every implementation has to follow the rules
 * below so that middlewares can rely on them without caring about the implementation:
 *
 * - header names are case-insensitive and get stored lowercase
 * - a header name has to be a token (RFC 9110 5.1) and a header value must not contain CR, LF or NUL, otherwise the
 *   `with*` helpers throw an error
 * - the `with*` helpers never change the given message or uri, they return a new one
 * - a query gets parsed with nested keys like `key[sub]=value` and `key[]=value` into objects and arrays, repeated keys
 *   into arrays, `+` and percent-encodings get decoded, a key must never change the prototype (`__proto__`), the limits
 *   (depth, array size, number of parameters) are up to the implementation
 * - query params get serialized with indexed nested keys like `key[sub]=value` and `key[0]=value`, keys and values
 *   percent-encoded (RFC 3986, space as `%20`), empty arrays and objects get dropped: parsing the serialized query
 *   params returns them again (within the limits of the parsing)
 * - the port of a uri is `undefined` if it is the standard port of its scheme (80 for http, 443 for https)
 * - a cookie name has to be a token, a cookie value has to consist of cookie-octets (RFC 6265 4.1.1), optionally
 *   within double quotes: values get neither encoded nor decoded, encode them yourself if needed
 * - a cookie path and domain must not contain `;` or control characters, an invalid `maxAge` or `expires` throws an
 *   error
 * - a `__Secure-` prefixed cookie requires `secure`, a `__Host-` prefixed one requires `secure`, the path `/` and no
 *   domain (RFC 6265bis 4.1.3)
 * - the cookie attributes get serialized in the order `Path`, `Domain`, `Max-Age`, `Expires`, `Secure`, `HttpOnly`,
 *   `SameSite`, `Partitioned`, `Expires` as IMF-fixdate (like `Date.prototype.toUTCString`)
 */
export type MessageHelpers = {
  /** The values of the header, an empty array if the header is missing. */
  readonly getHeader: (message: Message, name: string) => ReadonlyArray<string>;
  /**
   * The values of the header joined with `', '`, an empty string if the header is missing. Throws an error for
   * `set-cookie`, its values cannot be joined (RFC 9110 5.3), use `getHeader` instead.
   */
  readonly getHeaderLine: (message: Message, name: string) => string;
  readonly hasHeader: (message: Message, name: string) => boolean;
  readonly withHeader: <M extends Message>(message: M, name: string, value: HeaderValue) => M;
  readonly withAddedHeader: <M extends Message>(message: M, name: string, value: HeaderValue) => M;
  readonly withoutHeader: <M extends Message>(message: M, name: string) => M;
  /** Throws an error for a protocol version other than `1.0`, `1.1`, `2` or `3`. */
  readonly withProtocolVersion: <M extends Message>(message: M, protocolVersion: string) => M;
  /** The given message keeps its body (streams cannot be copied). */
  readonly withBody: <M extends Message>(message: M, body: Body) => M;
};

export type RequestHelpers = MessageHelpers & {
  /** Throws an error for a method which is not a token (RFC 9110 9.1), the method is case-sensitive. */
  readonly withMethod: <R extends Request>(request: R, method: Method) => R;
  /**
   * The origin-form request target (RFC 9112 3.2.1): the path (`/` if empty) and the query (if any).
   */
  readonly getRequestTarget: (request: Request) => string;
  /**
   * Sets the `host` header out of the authority of the uri (without user info), unless the uri has no host, or
   * `preserveHost` is true and the request has a `host` header already.
   */
  readonly withUri: <R extends Request>(request: R, uri: Uri, preserveHost?: boolean) => R;
  /** E.g. combined with a timeout: `AbortSignal.any([request.signal, AbortSignal.timeout(ms)])`. */
  readonly withSignal: <R extends Request>(request: R, signal: AbortSignal) => R;
  readonly getQueryParams: (request: Request) => Query;
  readonly withQueryParams: <R extends Request>(request: R, queryParams: Query) => R;
};

type WithAttributes<S extends ServerRequest, A extends Attributes> =
  ServerRequest<S['attributes']> extends S ? ServerRequest<A> : Omit<S, 'attributes'> & ServerRequest<A>;

export type ServerRequestHelpers = RequestHelpers & {
  /**
   * The cookies of the `cookie` header (RFC 6265 5.4), values as sent (no decoding, surrounding double quotes
   * removed), the first occurrence of a name wins.
   */
  readonly getCookieParams: (request: Request) => Readonly<Record<string, string>>;
  /**
   * With a name only known at runtime (`string`), any existing attribute could get replaced, so their types widen to
   * include the type of the value.
   */
  readonly withAttribute: <S extends ServerRequest, N extends string, V>(
    request: S,
    name: N,
    value: V,
  ) => WithAttributes<
    S,
    string extends N
      ? { readonly [key in keyof S['attributes']]: S['attributes'][key] | V }
      : Omit<S['attributes'], N> & { readonly [key in N]: V }
  >;
  readonly withoutAttribute: <S extends ServerRequest, N extends keyof S['attributes'] & string>(
    request: S,
    name: N,
  ) => WithAttributes<S, Omit<S['attributes'], N>>;
};

export type ResponseHelpers = MessageHelpers & {
  /**
   * Throws an error for a status outside 100-599, the reason phrase falls back to the one of `STATUS_CODES` from
   * `node:http` (an empty string if unknown).
   */
  readonly withStatus: <R extends Response>(response: R, status: number, reasonPhrase?: string) => R;
  /** Appends a `set-cookie` header, existing ones are kept (a cookie may be set for multiple paths or domains). */
  readonly withCookie: <R extends Response>(response: R, name: string, value: string, options?: CookieOptions) => R;
  /**
   * Appends a `set-cookie` header expiring the cookie (empty value, `Max-Age=0` and `Expires` within 1970), the path
   * and domain have to match the ones the cookie got set with.
   */
  readonly withoutCookie: <R extends Response>(
    response: R,
    name: string,
    options?: Omit<CookieOptions, 'maxAge' | 'expires'>,
  ) => R;
};

export type UriHelpers = {
  /** `[user-info@]host[:port]`, an empty string if the uri has no host. */
  readonly getAuthority: (uri: Uri) => string;
  /** The uri as string (RFC 3986 5.3), with `//` and the authority only if the uri has a host. */
  readonly toString: (uri: Uri) => string;
  /** Lowercases the scheme, throws an error for an invalid one (RFC 3986 3.1), an empty scheme is allowed. */
  readonly withScheme: (uri: Uri, scheme: string) => Uri;
  /** Percent-encodes the user and the password (if given), joined with `:`. */
  readonly withUserInfo: (uri: Uri, user: string, password?: string) => Uri;
  /** Lowercases the host. */
  readonly withHost: (uri: Uri, host: string) => Uri;
  /** Throws an error for a port outside 1-65535, `undefined` removes the port. */
  readonly withPort: (uri: Uri, port: number | undefined) => Uri;
  /** Percent-encodes characters not allowed within a path, existing percent-encodings are kept. */
  readonly withPath: (uri: Uri, path: string) => Uri;
  /** Without the leading `?`, percent-encodes characters not allowed within a query, existing ones are kept. */
  readonly withQuery: (uri: Uri, query: string) => Uri;
  /** Without the leading `#`, percent-encodes characters not allowed within a fragment, existing ones are kept. */
  readonly withFragment: (uri: Uri, fragment: string) => Uri;
};
