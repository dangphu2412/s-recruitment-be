import { BadRequestException } from '@nestjs/common';
import { createUserClientCode } from './create-user-client.code';

export class BadRequestFileCreationFormatException extends BadRequestException {
  constructor() {
    super(createUserClientCode('FILE_CREATION_FORMAT'));
  }
}
