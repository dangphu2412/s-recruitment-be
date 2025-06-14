import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UploadUserFileValidatorPipe implements PipeTransform {
  transform(file: Express.Multer.File): any {
    const FIFTY_KB = 1024 * 50;

    if (file.size > FIFTY_KB) {
      throw new BadRequestException('File should be less than ' + FIFTY_KB);
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
