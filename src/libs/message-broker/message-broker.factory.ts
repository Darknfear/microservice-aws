/**
 * Message Broker Factory
 * Factory functions để tạo providers cho các service cụ thể
 * Sử dụng DI/IOC pattern
 */

import type { Provider } from '@nestjs/common';
import type { IMessageBrokerConfig } from '../core/communicator/communicator.type';
import {
  MESSAGE_BROKER_CONFIG,
  MESSAGE_BROKER_CONFIG_PROVIDER,
} from './message-broker-config.provider';
import { MessageBrokerService } from './message-broker.service';

/**
 * Tạo provider cho MessageBrokerService với config riêng cho một service
 */
export function createMessageBrokerServiceProvider(
  serviceName: string,
  config?: IMessageBrokerConfig,
): Provider<MessageBrokerService> {
  if (config) {
    return {
      provide: `MessageBrokerService_${serviceName}`,
      useFactory: (
        configProvider: IMessageBrokerConfigProvider,
        directConfig: IMessageBrokerConfig,
      ) => {
        return new MessageBrokerService(configProvider, directConfig, serviceName);
      },
      inject: [MESSAGE_BROKER_CONFIG_PROVIDER, MESSAGE_BROKER_CONFIG],
    };
  } else {
    return {
      provide: `MessageBrokerService_${serviceName}`,
      useFactory: (configProvider: IMessageBrokerConfigProvider) => {
        return new MessageBrokerService(configProvider, undefined, serviceName);
      },
      inject: [MESSAGE_BROKER_CONFIG_PROVIDER],
    };
  }
}

/**
 * Tạo provider cho config riêng của một service
 */
export function createServiceConfigProvider(
  serviceName: string,
  config: Partial<IMessageBrokerConfig>,
): Provider<IMessageBrokerConfig> {
  return {
    provide: `MESSAGE_BROKER_CONFIG_${serviceName}`,
    useValue: config,
  };
}

/**
 * Tạo token cho service-specific MessageBrokerService
 */
export function getMessageBrokerServiceToken(serviceName: string): string {
  return `MessageBrokerService_${serviceName}`;
}

/**
 * Tạo token cho service-specific config
 */
export function getServiceConfigToken(serviceName: string): string {
  return `MESSAGE_BROKER_CONFIG_${serviceName}`;
}
