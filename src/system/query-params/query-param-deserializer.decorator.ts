import { Transform, TransformFnParams } from 'class-transformer';

export function DeserializeQueryToArray() {
  return Transform((params: TransformFnParams) => {
    return params.value ? params.value.split(',') : undefined;
  });
}
