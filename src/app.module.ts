import { Module } from '@nestjs/common';
import { ConfigurationModule } from './libs/core/configuration/configuration.module';

@Module({
  imports: [ConfigurationModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  // NestJS Module - intentionally empty
}
