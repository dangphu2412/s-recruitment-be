import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';

export function exceptionFactory(errors: ValidationError[]) {
  return new BadRequestException(errors.toString());
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private logger = new Logger(AppExceptionFilter.name);

  constructor() {}

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).message
      ) {
        message = (exceptionResponse as any).message;
      }
    } else {
      // Log internal error details
      this.logger.error(
        `Unexpected error on ${request.method} ${request.url}`,
        (exception as Error).stack || '',
      );
    }

    response.status(status).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
