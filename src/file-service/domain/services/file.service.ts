import { createInterfaceToken } from '../../../system/utils';
import { CreateFileCommand, FileUploadResponse } from '../dto/file.dto';

export const FileServiceToken = createInterfaceToken('FileServiceToken');

export interface FileService {
  upload(file: CreateFileCommand): Promise<FileUploadResponse>;
}
