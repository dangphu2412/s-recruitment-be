import { NotFoundException } from '@nestjs/common';
import { createRecruitmentClientCode } from './create-recruitment-client.code';

export class ExceedMaxPointException extends NotFoundException {
  constructor() {
    super(createRecruitmentClientCode('EXCEED_MAX_POINT_EMPLOYEE'));
  }
}
