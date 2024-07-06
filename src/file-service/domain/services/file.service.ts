import { createInterfaceToken } from '../../../system/utils';
import { CreateFileCommand, FileUploadResponse } from '../dto/file.dto';
import { ReadStream } from 'node:fs';

export const FileServiceToken = createInterfaceToken('FileServiceToken');

export interface FileService {
  upload(file: CreateFileCommand): Promise<FileUploadResponse>;
  get(filePath: string): ReadStream;
}
