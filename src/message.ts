export type Query = { readonly [key: string]: Query | ReadonlyArray<Query | string> | string };

export type Uri = {
  readonly scheme: string;
  readonly userInfo: string;
  readonly host: string;
  readonly port: number | undefined;
  readonly path: string;
  /** The raw query string (without `?`), percent-encoded as received, parsed by `getQueryParams`. */
  readonly query: string;
  readonly fragment: string;
};

export type Headers = Readonly<Record<string, ReadonlyArray<string>>>;

/**
 * The body, read once by iterating its chunks: a Node.js stream (`Readable`, `IncomingMessage`, `fs.ReadStream`) and a
 * web `ReadableStream` already are one. The chunks have to be bytes (`Uint8Array`, `Buffer`), never objects.
 */
export type Body = AsyncIterable<Uint8Array>;

export type Message = {
  readonly protocolVersion: string;
  readonly headers: Headers;
  readonly body: Body;
};

export type Method =
  | 'ACL' // RFC 3744 (WebDAV Access Control)
  | 'BASELINE-CONTROL' // RFC 3253 (WebDAV Versioning)
  | 'BIND' // RFC 5842 (WebDAV Bindings)
  | 'CHECKIN' // RFC 3253
  | 'CHECKOUT' // RFC 3253
  | 'CONNECT' // RFC 9110
  | 'COPY' // RFC 4918 (WebDAV)
  | 'DELETE' // RFC 9110
  | 'GET' // RFC 9110
  | 'HEAD' // RFC 9110
  | 'LABEL' // RFC 3253
  | 'LINK' // RFC 2068 (historic)
  | 'LOCK' // RFC 4918
  | 'MERGE' // RFC 3253
  | 'MKACTIVITY' // RFC 3253
  | 'MKCALENDAR' // RFC 4791 (CalDAV)
  | 'MKCOL' // RFC 4918
  | 'MKREDIRECTREF' // RFC 4437 (WebDAV Redirect Refs)
  | 'MKWORKSPACE' // RFC 3253
  | 'MOVE' // RFC 4918
  | 'OPTIONS' // RFC 9110
  | 'ORDERPATCH' // RFC 3648 (WebDAV Ordered Collections)
  | 'PATCH' // RFC 5789
  | 'POST' // RFC 9110
  | 'PRI' // RFC 9113 (HTTP/2 connection preface only)
  | 'PROPFIND' // RFC 4918
  | 'PROPPATCH' // RFC 4918
  | 'PUT' // RFC 9110
  | 'QUERY' // IETF draft, not yet a final RFC
  | 'REBIND' // RFC 5842
  | 'REPORT' // RFC 3253
  | 'SEARCH' // RFC 5323 (WebDAV Search)
  | 'TRACE' // RFC 9110
  | 'UNBIND' // RFC 5842
  | 'UNCHECKOUT' // RFC 3253
  | 'UNLINK' // RFC 2068 (historic)
  | 'UNLOCK' // RFC 4918
  | 'UPDATE' // RFC 3253
  | 'UPDATEREDIRECTREF' // RFC 4437
  | 'VERSION-CONTROL' // RFC 3253
  | (string & {});

export type Request = {
  readonly method: Method;
  readonly uri: Uri;
  /**
   * Aborted when the request is no longer needed: the client disconnected (server) or the caller cancelled (client).
   * Created and aborted by the bridge, passed on to e.g. `fetch` or database calls by handlers and middlewares.
   */
  readonly signal: AbortSignal;
} & Message;

export type Response = {
  readonly status: number;
  readonly reasonPhrase: string;
} & Message;

export type Attributes = Readonly<Record<string, unknown>>;

export type ServerRequest<A extends Attributes = Attributes> = Request & {
  readonly attributes: Readonly<A>;
};
