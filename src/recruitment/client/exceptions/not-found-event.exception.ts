import { NotFoundException } from '@nestjs/common';
import { createRecruitmentClientCode } from './create-recruitment-client.code';

export class NotFoundEventException extends NotFoundException {
  constructor() {
    super(createRecruitmentClientCode('NOT_FOUND_EVENT'));
  }
}
