import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyHelmet } from '@fastify/helmet';
import compression from '@fastify/compress';
import { contentParser } from 'fastify-multer';
import { AppModule } from './app.module';
import {
  AppExceptionFilter,
  exceptionFactory,
} from './system/exception/exception.service';
import { initializeTransactionalContext } from 'typeorm-transactional';
import morgan from 'morgan';
import { ConfigService } from '@nestjs/config';

const MAIN_CONTEXT = 'MainContext';

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

  app.use(morgan('common'));
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
      exceptionFactory: exceptionFactory,
    }),
  );

  const logger = new Logger();
  app.useGlobalFilters(new AppExceptionFilter(logger));

  const configService = app.get(ConfigService);

  await app.listen(
    configService.get('PORT', 3000),
    configService.get('HOST', '127.0.0.1'),
    (err, address) => {
      if (err) {
        logger.log(err, MAIN_CONTEXT);
        return;
      }

      logger.log(`Server is listening on: ${address}`, MAIN_CONTEXT);
      const memUsage = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);

      logger.log(
        `Application is running in ${configService.get('NODE_ENV')} mode`,
        MAIN_CONTEXT,
      );
      logger.log(
        `Memory usage: ${memUsage} MB - CPU usage: ${process.cpuUsage().user}`,
        MAIN_CONTEXT,
      );
    },
  );
}

bootstrap();
