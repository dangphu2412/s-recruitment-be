import { NotFoundException } from '@nestjs/common';
import { createUserClientCode } from './create-user-client.code';

export class NotFoundSheetNameException extends NotFoundException {
  constructor() {
    super(
      createUserClientCode({
        errorCode: 'NOT_FOUND_SHEET',
        message: 'No sheet found',
      }),
    );
  }
}
