import { ConflictException } from '@nestjs/common';
import { createRecruitmentClientCode } from './create-recruitment-client.code';

export class DuplicatedEventName extends ConflictException {
  constructor() {
    super(createRecruitmentClientCode('DUPLICATED_EVENT'));
  }
}
