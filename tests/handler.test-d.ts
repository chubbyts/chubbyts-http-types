import { describe, expectTypeOf, test } from 'vitest';
import type { Handler } from '../src/handler.js';
import type { Response, ServerRequest } from '../src/message.js';

type NameAttributes = { name: string };

const nameHandler = async (request: ServerRequest<NameAttributes>): Promise<Response> => {
  expectTypeOf(request.attributes.name).toEqualTypeOf<string>();

  return {} as Response;
};

describe('Handler', () => {
  test('takes the server request with its attributes', () => {
    expectTypeOf<Handler<NameAttributes>>().parameter(0).toEqualTypeOf<ServerRequest<NameAttributes>>();
    expectTypeOf<Handler<NameAttributes>>().returns.toEqualTypeOf<Promise<Response>>();
  });

  test('accepts a handler expecting specific attributes', () => {
    const handler: Handler = nameHandler;

    expectTypeOf(handler).toBeFunction();
  });

  test('rejects a call with missing attributes', () => {
    const handler: Handler<NameAttributes> = nameHandler;

    expectTypeOf<ServerRequest>().not.toExtend<Parameters<typeof handler>[0]>();
    // @ts-expect-error name is missing
    void handler({} as ServerRequest);
  });
});
