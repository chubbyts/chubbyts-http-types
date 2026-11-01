import { describe, expectTypeOf, test } from 'vitest';
import type { BodyFactory, BodyFromFileFactory, StreamFactory, StreamFromFileFactory } from '../src/message-factory.js';
import type { Body } from '../src/message.js';

describe('message-factory', () => {
  test('BodyFactory', () => {
    expectTypeOf<BodyFactory>().toEqualTypeOf<(content: string) => Body>();
  });

  test('BodyFromFileFactory', () => {
    expectTypeOf<BodyFromFileFactory>().toEqualTypeOf<(filename: string) => Body>();
  });

  test('deprecated aliases stay compatible', () => {
    expectTypeOf<StreamFactory>().toEqualTypeOf<BodyFactory>();
    expectTypeOf<StreamFromFileFactory>().toEqualTypeOf<BodyFromFileFactory>();
  });
});
