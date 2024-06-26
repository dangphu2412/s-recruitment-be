import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { FileService, FileServiceToken } from '../domain/services/file.service';
import { FileInterceptor } from '../../system/file';

@ApiTags('files')
@Controller({
  path: 'files',
  version: '1',
})
export class FileController {
  constructor(
    @Inject(FileServiceToken)
    private readonly fileService: FileService,
  ) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiNoContentResponse()
  upload(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.fileService.upload(file);
  }
}
