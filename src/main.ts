import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
  patchTypeORMTreeRepositoryWithBaseTreeRepository,
} from 'typeorm-transactional-cls-hooked';
import { ClientExceptionFilter } from './exception/exception.filter';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyHelmet } from '@fastify/helmet';
import compression from 'fastify-compress';
import { logAppScaffold } from './utils';
import { registerPaginationConfig } from '@shared/query-shape/pagination/config/register-pagination.config';
import { contentParser } from 'fastify-multer';

async function bootstrap() {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  patchTypeORMTreeRepositoryWithBaseTreeRepository();
  registerPaginationConfig();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const config = new DocumentBuilder()
    .setTitle('App example')
    .setDescription('The App API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  await app.register(contentParser);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new ClientExceptionFilter());

  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT');
  const host = configService.get<string>('HOST');

  await app.listen(port ?? 3000, host ?? '0.0.0.0', (err, address) => {
    if (err) {
      Logger.log(err);
    }

    Logger.log(`Server is listening on: ${address}`, 'AppBootstrap');
  });

  logAppScaffold(app);
}

bootstrap();
