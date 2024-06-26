import { Module } from '@nestjs/common';
import { FileServiceToken } from '../domain/services/file.service';
import { FileServiceImpl } from '../app/file.service';
import { FileController } from '../adapters/file.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'upload'),
      serveRoot: '/upload',
    }),
  ],
  controllers: [FileController],
  providers: [
    {
      provide: FileServiceToken,
      useClass: FileServiceImpl,
    },
  ],
})
export class FileServiceModule {}
