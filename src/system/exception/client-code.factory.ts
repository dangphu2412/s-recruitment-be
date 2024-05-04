import { ClientError } from './exception.interface';
import { BizException } from './biz-exception';

export type ClientCodeFactory = (
  errorOrErrorCode: Pick<ClientError, 'errorCode' | 'message'> | string,
) => ClientError;

export function createClientCodeFactory(module: string): ClientCodeFactory {
  return (errorOrErrorCode) => {
    if (typeof errorOrErrorCode === 'string') {
      return {
        errorCode: `${module}${errorOrErrorCode}`,
        code: `${module}${errorOrErrorCode}`,
        message: 'There is a system error',
      };
    }

    return {
      errorCode: `${module}${errorOrErrorCode.errorCode}`,
      code: `${module}${errorOrErrorCode.errorCode}`,
      message: errorOrErrorCode.message,
    };
  };
}

export const createSystemClientCode = createClientCodeFactory('SYS_');

export function isClientException(response: any): response is ClientError {
  return !!(response as ClientError).errorCode;
}

export function isBizException(exception: unknown): exception is BizException {
  return exception instanceof BizException;
}
