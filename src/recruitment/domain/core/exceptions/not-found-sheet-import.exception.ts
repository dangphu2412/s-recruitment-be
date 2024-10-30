import { createRecruitmentClientCode } from './create-recruitment-client.code';
import { BizException } from '../../../../system/exception';
import { HttpStatus } from '@nestjs/common';

export class NotFoundSheetNameException extends BizException {
  constructor() {
    super('Not found sheet', HttpStatus.NOT_FOUND);
    const clientError = createRecruitmentClientCode('NOT_FOUND_SHEET');
    this.errorCode = clientError.errorCode;
    this.code = clientError.code;
  }
}
