/**
 * Message Broker Module Exports
 * Export tất cả các types, interfaces, và providers để sử dụng trong các module khác
 */

// Module
export { MessageBrokerModule, MessageBrokerModuleOptions } from './message-broker.module';
export {
  MessageBrokerConfigModule,
  MessageBrokerConfigModuleOptions,
} from './message-broker-config.module';

// Services
export {
  MessageBrokerService,
  BrokerType,
  MessageEvent,
  SubscriptionHandler,
} from './message-broker.service';
export { CommunicatorService } from '../core/communicator/communicator.service';

// Config Providers
export {
  IMessageBrokerConfigProvider,
  MessageBrokerConfigProvider,
  MESSAGE_BROKER_CONFIG_PROVIDER,
  MESSAGE_BROKER_CONFIG,
} from './message-broker-config.provider';

// Types
export { IMessageBrokerConfig } from '../core/communicator/communicator.type';
