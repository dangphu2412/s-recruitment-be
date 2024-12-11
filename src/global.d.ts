export declare global {
  type Nullable<T> = T | null;

  type Nil<T> = T | undefined;

  type RequiredWith<T, K extends keyof T> = Required<Pick<T, K>> & T;

  interface Mapper<FromEntity, ToEntity> {
    from(fromEntity: FromEntity): ToEntity;
  }

  type Predicate<S extends T, T> = (
    value: T,
    index: number,
    array: T[],
  ) => value is S;

  type ClassConstructor<T> = new (...args: any[]) => T;
}
