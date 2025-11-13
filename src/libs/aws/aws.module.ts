/**
 * AWS Module
 * Shared NestJS module for AWS SDK operations
 * Can be imported by any microservice
 */

import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';

@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
