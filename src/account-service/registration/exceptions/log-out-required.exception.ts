import { BusinessException } from '../../../system/exception/exception.service';

export class LogOutRequiredException extends BusinessException {
  constructor() {
    super({
      code: 'IAM_REGISTRATION_LOGOUT',
      message: 'Log Out Required.',
    });
  }
}
