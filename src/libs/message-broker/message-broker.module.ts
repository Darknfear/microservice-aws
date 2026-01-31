/**
 * Message Broker Module
 * Shared NestJS module for event publishing/subscribing
 * Can be imported by any microservice
 * Sử dụng DI/IOC để quản lý cấu hình
 */

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MessageBrokerService } from './message-broker.service';
import {
  MessageBrokerConfigModule,
  MessageBrokerConfigModuleOptions,
} from './message-broker-config.module';
import type { IMessageBrokerConfig } from '../core/communicator/communicator.type';
import {
  MESSAGE_BROKER_CONFIG,
  MESSAGE_BROKER_CONFIG_PROVIDER,
} from './message-broker-config.provider';

export interface MessageBrokerModuleOptions {
  /**
   * Tên service để lấy config riêng
   */
  serviceName?: string;

  /**
   * Cấu hình trực tiếp cho service này
   * Nếu không có, sẽ sử dụng config từ MessageBrokerConfigModule
   */
  config?: IMessageBrokerConfig;

  /**
   * Options cho MessageBrokerConfigModule
   */
  configModuleOptions?: MessageBrokerConfigModuleOptions;
}

/**
 * Message Broker Module với DI/IOC
 */
@Module({})
export class MessageBrokerModule {
  /**
   * Tạo module với cấu hình tùy chỉnh
   */
  static forRoot(options?: MessageBrokerModuleOptions): DynamicModule {
    const providers: Provider[] = [];

    // Import MessageBrokerConfigModule nếu chưa được import
    const imports: any[] = [];

    // Nếu có config trực tiếp, tạo provider cho nó
    if (options?.config) {
      providers.push({
        provide: MESSAGE_BROKER_CONFIG,
        useValue: options.config,
      });
    }

    // Import MessageBrokerConfigModule với options
    if (options?.configModuleOptions) {
      imports.push(MessageBrokerConfigModule.forRoot(options.configModuleOptions));
    } else {
      imports.push(MessageBrokerConfigModule.forRoot());
    }

    // Provider cho MessageBrokerService với service name
    if (options?.serviceName) {
      providers.push({
        provide: MessageBrokerService,
        useFactory: (configProvider: any, directConfig?: IMessageBrokerConfig) => {
          return new MessageBrokerService(configProvider, directConfig, options.serviceName);
        },
        inject: [
          MESSAGE_BROKER_CONFIG_PROVIDER,
          ...(options.config ? [MESSAGE_BROKER_CONFIG] : []),
        ],
      });
    } else {
      providers.push(MessageBrokerService);
    }

    return {
      module: MessageBrokerModule,
      imports,
      providers,
      exports: [MessageBrokerService],
    };
  }

  /**
   * Tạo module với cấu hình async
   */
  static forRootAsync(options?: {
    serviceName?: string;
    useFactory?: (...args: any[]) => Promise<IMessageBrokerConfig> | IMessageBrokerConfig;
    inject?: any[];
    configModuleOptions?: {
      useFactory?: (
        ...args: any[]
      ) => Promise<MessageBrokerConfigModuleOptions> | MessageBrokerConfigModuleOptions;
      inject?: any[];
    };
  }): DynamicModule {
    const providers: Provider[] = [];
    const imports: any[] = [];

    // Provider cho config nếu có factory
    if (options?.useFactory) {
      providers.push({
        provide: MESSAGE_BROKER_CONFIG,
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    // Import MessageBrokerConfigModule
    if (options?.configModuleOptions) {
      imports.push(MessageBrokerConfigModule.forRootAsync(options.configModuleOptions));
    } else {
      imports.push(MessageBrokerConfigModule.forRoot());
    }

    // Provider cho MessageBrokerService
    providers.push({
      provide: MessageBrokerService,
      useFactory: (configProvider: any, directConfig?: IMessageBrokerConfig) => {
        return new MessageBrokerService(configProvider, directConfig, options?.serviceName);
      },
      inject: [
        MESSAGE_BROKER_CONFIG_PROVIDER,
        ...(options?.useFactory ? [MESSAGE_BROKER_CONFIG] : []),
      ],
    });

    return {
      module: MessageBrokerModule,
      imports,
      providers,
      exports: [MessageBrokerService],
    };
  }
}
