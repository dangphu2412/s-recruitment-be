import { Transform, TransformFnParams } from 'class-transformer';

export function ToManyString() {
  return Transform((params: TransformFnParams) => {
    return params.value.split(',');
  });
}
