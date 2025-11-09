import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

type IEntryNestModule = Type<any> | DynamicModule | ForwardReference | Promise<IEntryNestModule>;

interface IStartAppOptions {
  serviceName?: string;
}

export async function startApp<T>(
  appModule: IEntryNestModule,
  options?: IStartAppOptions,
): Promise<void> {
  console.log(`Starting service: ${options?.serviceName ?? 'Unnamed Service'}`);
  const app = await NestFactory.create<NestExpressApplication>(appModule);

  // Configure service
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX');
  const port = configService.get<number>('PORT') ?? 3000;
  console.log(configService.get<string>('DB_HOST'));

  // Enable CORS for API access
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix(apiPrefix ?? 'api/v1');

  // Start server
  await app.listen(port, '0.0.0.0');
}
