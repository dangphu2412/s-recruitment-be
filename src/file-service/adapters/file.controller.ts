import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { FileService, FileServiceToken } from '../domain/services/file.service';
import { FileInterceptor } from '../../system/file';
import mimeTypes from 'mime-types';
import { extname } from 'path';
import etag from 'etag';
import { FastifyReply } from 'fastify';

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

  @Get('/:filePath')
  getFile(
    @Param('filePath') filePath: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): StreamableFile {
    const file = this.fileService.get(filePath);
    const extension = extname(filePath);
    const type = mimeTypes.lookup(extension);

    response.header('ETag', etag(filePath));
    response.header('Cache-Control', 'max-age=86400');

    return new StreamableFile(file, {
      type: type === false ? 'application/octet-stream' : type,
    });
  }
}
