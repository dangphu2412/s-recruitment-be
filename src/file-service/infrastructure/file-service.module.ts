import { Module } from '@nestjs/common';
import { FileServiceToken } from '../domain/services/file.service';
import { FileServiceImpl } from '../app/file.service';
import { FileController } from '../adapters/file.controller';

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
