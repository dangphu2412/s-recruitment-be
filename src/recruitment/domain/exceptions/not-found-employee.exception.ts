import { NotFoundException } from '@nestjs/common';
import { createRecruitmentClientCode } from './create-recruitment-client.code';

export class NotFoundEmployeeException extends NotFoundException {
  constructor() {
    super(createRecruitmentClientCode('NOT_FOUND_EMPLOYEE'));
  }
}
