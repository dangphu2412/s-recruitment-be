import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UploadActivityLogFileValidatorPipe implements PipeTransform {
  transform(file: Express.Multer.File): any {
    const FOUR_MEGABYTE = 1024 * 1024 * 4;

    if (file.size > FOUR_MEGABYTE) {
      throw new BadRequestException(
        'File should be less than ' + FOUR_MEGABYTE,
      );
    }

    if (file.mimetype !== 'application/json') {
      throw new BadRequestException('Invalid mimetype');
    }

    return file;
  }
}
