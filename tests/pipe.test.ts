import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';
import { describe, expect, test } from 'vitest';
import type { ServerRequest } from '../src/message.js';
import { pipe } from '../src/pipe.js';

describe('pipe', () => {
  test('with 3 middlewares', async () => {
    const middleware = pipe<{ middleware1?: boolean; middleware2?: boolean; middleware3?: boolean }>([
      async (request, handler) => {
        return handler({ ...request, attributes: { ...request.attributes, middleware1: true } });
      },
      async (request, handler) => {
        return handler({ ...request, attributes: { ...request.attributes, middleware2: true } });
      },
      async (request, handler) => {
        return handler({ ...request, attributes: { ...request.attributes, middleware3: true } });
      },
    ]);

    const serverRequest: ServerRequest = {
      method: 'GET',
      uri: {
        scheme: 'https',
        userInfo: '',
        host: 'example.com',
        port: undefined,
        path: '/',
        query: '',
        fragment: '',
      },
      protocolVersion: '1.1',
      headers: {},
      body: Readable.from([]),
      signal: new AbortController().signal,
      attributes: {},
    };

    const response = await middleware(serverRequest, async (request) => {
      const body = Readable.from([Buffer.from(JSON.stringify(request.attributes))]);

      return { protocolVersion: '1.1', status: 200, reasonPhrase: 'OK', headers: {}, body };
    });

    expect(await text(response.body)).toMatchInlineSnapshot(
      '"{"middleware1":true,"middleware2":true,"middleware3":true}"',
    );
  });
});
