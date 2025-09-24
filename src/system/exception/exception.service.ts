import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';

type ExceptionContext = {
  code: string;
  message: string;
};

export class BusinessException extends Error {
  code: string;

  constructor({ code, message }: ExceptionContext) {
    super(message);
    this.code = code;
  }
}

export function exceptionFactory(errors: ValidationError[]) {
  return new BadRequestException(errors.toString());
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(
    exception: HttpException | Error | BusinessException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof BusinessException) {
      this.logger.debug(exception);

      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        businessCode: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception instanceof HttpException) {
      if (exception.getStatus() >= 500) {
        this.logger.error(exception);
      }

      return response.status(exception.getStatus()).send({
        statusCode: exception.getStatus(),
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    this.logger.error(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
