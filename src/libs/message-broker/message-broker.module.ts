/**
 * Message Broker Module
 * Shared NestJS module for event publishing/subscribing
 * Can be imported by any microservice
 */

import { Module } from '@nestjs/common';
import { MessageBrokerService } from './message-broker.service';

@Module({
  providers: [MessageBrokerService],
  exports: [MessageBrokerService],
})
export class MessageBrokerModule {}
