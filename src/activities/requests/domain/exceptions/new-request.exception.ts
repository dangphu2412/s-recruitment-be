import { BusinessException } from '../../../../system/exception/exception.service';

export class NewRequestInvalidInputException extends BusinessException {
  constructor() {
    super({
      code: 'ACTIVITY_REQUEST_INVALID_INPUT',
      message: 'Invalid activity request input',
    });
  }
}
