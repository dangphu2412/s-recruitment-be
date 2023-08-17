import { HttpStatus } from '@nestjs/common';
import { Mapper } from '../../client/mapper.interface';

export class HttpToClientCodeMapper implements Mapper<HttpStatus, string> {
  from(from: HttpStatus): string {
    return from + '';
  }
}
