import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class DeviceUserFileValidatorPipe implements PipeTransform {
  transform(file: Express.Multer.File): any {
    const TWO_HUNDRED_KB = 1024 * 200;

    if (file.size > TWO_HUNDRED_KB) {
      throw new BadRequestException('Exceed limit');
    }

    if (file.mimetype !== 'application/json') {
      throw new BadRequestException('Invalid mimetype');
    }

    return file;
  }
}
