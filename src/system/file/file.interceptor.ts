import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import FastifyMulter from 'fastify-multer';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

/**
 * Since Fastify Multer does not export File type so this ref to File implement of fastify-multer
 */
export type InternalFile = {
  /** Field name specified in the form */
  fieldname: string;
  /** Name of the file on the user's computer */
  originalname: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimetype: string;
  /** Size of the file in bytes */
  size?: number;
  /** The folder to which the file has been saved (DiskStorage) */
  destination?: string;
  /** The name of the file within the destination (DiskStorage) */
  filename?: string;
  /** Location of the uploaded file (DiskStorage) */
  path?: string;
  /** A Buffer of the entire file (MemoryStorage) */
  buffer?: Buffer;
  stream?: NodeJS.ReadableStream;
};

export function FileInterceptor(fieldName: string): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: ReturnType<typeof FastifyMulter>;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: ReturnType<typeof FastifyMulter>,
    ) {
      this.multer = FastifyMulter({ ...options });
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise<void>((resolve, reject) => {
        const handler = this.multer.single(fieldName).bind(this.multer);

        const errorHandler: HookHandlerDoneFunction = (error: Error) => {
          if (error) {
            reject(error);
          }

          resolve();
        };

        handler(
          ctx.getRequest<FastifyRequest>(),
          ctx.getResponse<FastifyReply>(),
          errorHandler,
        );
      });

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
