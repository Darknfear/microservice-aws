/**
 * JWT Module
 * Shared NestJS module for JWT operations
 * Can be imported by any microservice
 */

import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
