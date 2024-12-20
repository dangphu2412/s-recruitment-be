import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyHelmet } from '@fastify/helmet';
import compression from '@fastify/compress';
import { contentParser } from 'fastify-multer';
import { AppModule } from './app.module';
import { ClientExceptionFilter } from './system/exception/exception.filter';
import { EnvironmentKeyFactory } from './system/services';
import { createSystemClientCode } from './system/exception';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();

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
      exceptionFactory: (errors) => {
        return new BadRequestException(
          createSystemClientCode({
            errorCode: 'BAD_REQUEST',
            message: errors.toString(),
          }),
        );
      },
    }),
  );

  const logger = new Logger();
  app.useGlobalFilters(new ClientExceptionFilter(logger));

  const environmentKeyFactory = app.get(EnvironmentKeyFactory);

  await app.listen(
    environmentKeyFactory.getPort(),
    environmentKeyFactory.getHost(),
    (err, address) => {
      if (err) {
        logger.log(err);
        return;
      }

      logger.log(`Server is listening on: ${address}`, 'AppBootstrap');
      const memUsage = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);

      logger.log(
        `Application is running in ${environmentKeyFactory.getEnv()} mode`,
      );
      logger.log(
        `Memory usage: ${memUsage} MB -` +
          'CPU usage: ' +
          process.cpuUsage().user,
      );
    },
  );
}

bootstrap();
