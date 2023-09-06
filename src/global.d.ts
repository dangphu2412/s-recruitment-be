export declare global {
  type Nullable<T> = T | null;

  type Nil<T> = T | undefined;

  type RequiredWith<T, K extends keyof T> = Required<Pick<T, K>> & T;
}
