import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    // NOTE: Database connections moved to individual modules
    // Each service will configure its own database connections as needed
    // This allows services to run without database (e.g., using in-memory storage)
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigurationModule {
  // Configuration Module - database connections handled per module
}
