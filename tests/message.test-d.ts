import type { IncomingMessage } from 'node:http';
import type { ReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { describe, expectTypeOf, test } from 'vitest';
import type { Body, Method, Query, ServerRequest } from '../src/message.js';

const request: ServerRequest<{ requestId: string }> = {
  method: 'GET',
  uri: {
    scheme: 'https',
    userInfo: '',
    host: 'example.com',
    port: undefined,
    path: '/',
    query: 'key1=value1&key2[]=value2&key3[key31]=value3',
    fragment: '',
  },
  protocolVersion: '1.1',
  headers: { accept: ['application/json'] },
  body: Readable.from([]),
  signal: new AbortController().signal,
  attributes: { requestId: 'request-1' },
};

describe('Method', () => {
  test('accepts known methods', () => {
    expectTypeOf<'GET'>().toExtend<Method>();
  });

  test('accepts extension methods', () => {
    expectTypeOf<'PROPFIND'>().toExtend<Method>();
  });
});

describe('Body', () => {
  test('accepts node and web streams', () => {
    expectTypeOf<Readable>().toExtend<Body>();
    expectTypeOf<IncomingMessage>().toExtend<Body>();
    expectTypeOf<ReadStream>().toExtend<Body>();
    expectTypeOf<ReadableStream<Uint8Array>>().toExtend<Body>();
    expectTypeOf<AsyncGenerator<Buffer>>().toExtend<Body>();
  });

  test('rejects strings and synchronous iterables', () => {
    expectTypeOf<string>().not.toExtend<Body>();
    expectTypeOf<Array<Uint8Array>>().not.toExtend<Body>();
    expectTypeOf<ReadableStream<string>>().not.toExtend<Body>();
  });
});

describe('Query', () => {
  test('accepts lists of strings and nested queries', () => {
    expectTypeOf<{ key: ['value', { sub: 'value' }] }>().toExtend<Query>();
  });
});

describe('ServerRequest', () => {
  test('is readonly', () => {
    type RequestProperties = Pick<typeof request, keyof typeof request>;
    expectTypeOf<RequestProperties>().toEqualTypeOf<Readonly<RequestProperties>>();
    expectTypeOf(request.uri).toEqualTypeOf<Readonly<typeof request.uri>>();
    expectTypeOf(request.headers).toEqualTypeOf<Readonly<Record<string, ReadonlyArray<string>>>>();
    expectTypeOf(request.attributes).toEqualTypeOf<Readonly<{ requestId: string }>>();
    /* oxlint-disable functional/immutable-data */
    // @ts-expect-error readonly
    request.method = 'POST';
    // @ts-expect-error readonly
    request.uri.path = '/other';
    // @ts-expect-error readonly
    request.uri.query = 'key1=other';
    // @ts-expect-error readonly
    request.headers.accept = ['text/html'];
    // @ts-expect-error readonly
    request.headers.accept.push('text/html');
    // @ts-expect-error readonly
    request.attributes.requestId = 'request-2';
    // @ts-expect-error readonly
    request.body = Readable.from([]);
    // @ts-expect-error readonly
    request.signal = new AbortController().signal;
    /* oxlint-enable functional/immutable-data */
  });

  test('can be changed by copying', () => {
    expectTypeOf({
      ...request,
      headers: { ...request.headers, accept: [...(request.headers.accept ?? []), 'text/html'] },
    }).toExtend<ServerRequest<{ requestId: string }>>();
  });
});
