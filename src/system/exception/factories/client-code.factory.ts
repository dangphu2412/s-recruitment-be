import { ClientError } from '../../client/exception.interface';

export type ClientCodeFactory = (
  errorOrErrorCode: ClientError | string,
) => ClientError;

export function createClientCodeFactory(module: string): ClientCodeFactory {
  return (errorOrErrorCode) => {
    if (typeof errorOrErrorCode === 'string') {
      return {
        errorCode: `${module}${errorOrErrorCode}`,
        message: 'There is a system error',
      };
    }

    return {
      errorCode: `${module}${errorOrErrorCode.errorCode}`,
      message: errorOrErrorCode.message,
    };
  };
}

export const createSystemClientCode = createClientCodeFactory('SYS_');

export function isClientException(response: any): response is ClientError {
  return !!(response as ClientError).errorCode;
}
