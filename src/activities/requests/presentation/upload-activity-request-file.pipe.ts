import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InternalFile } from '../../../system/file/file.interceptor';

@Injectable()
export class UploadRequestActivityFileValidatorPipe implements PipeTransform {
  transform(file: InternalFile): any {
    const TWO_HUNDRED_KB = 1024 * 200;

    if (file.size > TWO_HUNDRED_KB) {
      throw new BadRequestException(
        'File should be less than ' + TWO_HUNDRED_KB,
      );
    }

    if (
      ![
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
      ].includes(file.mimetype)
    ) {
      throw new BadRequestException('Invalid mimetype');
    }

    return file;
  }
}
