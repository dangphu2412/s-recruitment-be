export interface AuthorizationStrategy<T = any, R = any> {
  canAccess(providedData: T, toCompareData: R): boolean | Promise<boolean>;
}
