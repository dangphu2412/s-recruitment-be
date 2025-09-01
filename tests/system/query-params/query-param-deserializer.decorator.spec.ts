import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { DeserializeQueryToArray } from '../../../src/system/query-params/query-param-deserializer.decorator';

describe('DeserializeQueryToArray', () => {
  class TestDto {
    @DeserializeQueryToArray()
    tags?: string[];
  }

  it('should transform a comma-separated string into an array', () => {
    const plain = { tags: 'apple,banana,cherry' };

    const result = plainToInstance(TestDto, plain);

    expect(result.tags).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should return undefined if the value is missing', () => {
    const plain = {};

    const result = plainToInstance(TestDto, plain);

    expect(result.tags).toBeUndefined();
  });

  it('should return single-element array if there is no comma', () => {
    const plain = { tags: 'onlyOne' };

    const result = plainToInstance(TestDto, plain);

    expect(result.tags).toEqual(['onlyOne']);
  });

  it('should handle empty string and return undefined', () => {
    const plain = { tags: '' };

    const result = plainToInstance(TestDto, plain);

    expect(result.tags).toEqual(undefined);
  });
});
