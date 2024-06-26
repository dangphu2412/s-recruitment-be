import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  StreamableFile,
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

  @Get('/upload/:path')
  async getFile(@Param('path') path: string) {
    const file = await this.fileService.getFile(path);

    return new StreamableFile(file);
  }
}
