export type Nullable<T> = T | null;

export type Undefined<T> = T | undefined;

export type RequiredWith<T, K extends keyof T> = Required<Pick<T, K>> & T;
