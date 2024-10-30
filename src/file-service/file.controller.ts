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
import { FileService, FileServiceToken } from './domain/core/file.service';
import { FileInterceptor } from '../system/file';
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
  findFileByPath(
    @Param('filePath') filePath: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): StreamableFile {
    const file = this.fileService.findByPath(filePath);
    const extension = extname(filePath);
    const type = mimeTypes.lookup(extension);

    response.header('ETag', etag(filePath));
    response.header('Cache-Control', 'max-age=86400');
    response.header('Cross-Origin-Resource-Policy', 'cross-origin');
    response.header('Cross-Origin-Opener-Policy', 'cross-origin');

    return new StreamableFile(file, {
      type: type === false ? 'application/octet-stream' : type,
    });
  }
}
