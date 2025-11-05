import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { appConfig, getServerUrl } from './apps/index';

async function bootstrap() {
  // Use Fastify adapter for better performance with Bun
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Enable CORS for API access
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Get port from environment or use default
  const port = process.env.PORT ?? 3000;

  // Start server
  await app.listen(port, '0.0.0.0');

  // eslint-disable-next-line no-console
  console.log(
    `🚀 ${appConfig.name} v${appConfig.version} is running on: ${getServerUrl(Number(port))}`,
  );
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap().catch((error: unknown) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
