import { HttpException } from '@nestjs/common';
import { ClientError } from './exception.interface';

export class BizException extends HttpException implements ClientError {
  errorCode: string;
  code: string;
}
