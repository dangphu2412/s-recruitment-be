import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { SystemExceptionClientCode } from './exception-client-code.constant';
import { isBizException, isClientException } from './index';
import { ClientError } from './exception.interface';

@Catch()
export class ClientExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (
      exception instanceof HttpException &&
      isClientException(exception.getResponse())
    ) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse() as ClientError;

      return response.status(status).send({
        ...errorResponse,
        statusCode: status,
      });
    }

    if (isBizException(exception)) {
      return response.status(exception.getStatus()).send({
        ...exception,
        statusCode: exception.getStatus(),
      });
    }

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).send({
        ...SystemExceptionClientCode.GOT_ISSUE,
        statusCode: exception.getStatus(),
        code: exception.getStatus().toString(),
        errorCode: exception.getStatus().toString(),
      });
    }

    this.logger.error(exception.message, exception.stack);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      ...SystemExceptionClientCode.GOT_ISSUE,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
