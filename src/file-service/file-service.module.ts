import { Module } from '@nestjs/common';
import { FileServiceToken } from './domain/core/file.service';
import { FileServiceImpl } from './file.service';
import { FileController } from './file.controller';

@Module({
  controllers: [FileController],
  providers: [
    {
      provide: FileServiceToken,
      useClass: FileServiceImpl,
    },
  ],
})
export class FileServiceModule {}
