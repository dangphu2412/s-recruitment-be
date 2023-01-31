declare type RequiredWith<T, K extends keyof T> = Required<Pick<T, K>> & T;
