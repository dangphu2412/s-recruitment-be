import { BusinessException } from '../exception/exception.service';

export class InvalidStateError extends BusinessException {
  constructor(message: string) {
    super({
      code: 'DDD_INVALID_RULE',
      message: message,
    });
  }
}
