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
import { Options, Multer } from 'multer';

export function FileInterceptor(
  fieldName: string,
  localOptions?: Options,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: Multer;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      this.multer = (FastifyMulter as any)({ ...options, ...localOptions });
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise<void>((resolve, reject) =>
        this.multer.single(fieldName)(
          ctx.getRequest(),
          ctx.getResponse(),
          (error: any) => {
            if (error) {
              return reject(error);
            }

            return resolve();
          },
        ),
      );

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
