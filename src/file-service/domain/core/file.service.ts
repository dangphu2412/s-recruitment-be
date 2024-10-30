import { createInterfaceToken } from '../../../system/utils';
import { CreateFileDTO, CreatedFileDTO } from './dto/file.dto';
import { ReadStream } from 'node:fs';

export const FileServiceToken = createInterfaceToken('FileServiceToken');

export interface FileService {
  upload(file: CreateFileDTO): Promise<CreatedFileDTO>;
  findByPath(path: string): ReadStream;
}
