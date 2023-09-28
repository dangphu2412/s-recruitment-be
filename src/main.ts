import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
  patchTypeORMTreeRepositoryWithBaseTreeRepository,
} from 'typeorm-transactional-cls-hooked';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyHelmet } from '@fastify/helmet';
import compression from '@fastify/compress';
import { contentParser } from 'fastify-multer';
import { AppModule } from './app.module';
import { ClientExceptionFilter } from './system/exception/exception.filter';
import { logAppScaffold } from './system/utils';
import { EnvironmentKeyFactory } from './system/services';

async function bootstrap() {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  patchTypeORMTreeRepositoryWithBaseTreeRepository();

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
  SwaggerModule.setup('docs', app, document);

  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  await app.register(contentParser);
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
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new ClientExceptionFilter());

  const environmentKeyFactory = app.get(EnvironmentKeyFactory);
  const port = environmentKeyFactory.getPort();
  const host = environmentKeyFactory.getHost();

  await app.listen(port, host, (err, address) => {
    if (err) {
      Logger.log(err);
    }

    Logger.log(`Server is listening on: ${address}`, 'AppBootstrap');
  });

  await logAppScaffold(app);
}

bootstrap();
