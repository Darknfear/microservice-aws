/**
 * Message Broker Config Module
 * Module NestJS để quản lý cấu hình message broker với DI/IOC
 * Cho phép các service khác nhau có config riêng biệt
 */

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { IMessageBrokerConfig } from '../core/communicator/communicator.type';
import {
  MESSAGE_BROKER_CONFIG,
  MESSAGE_BROKER_CONFIG_PROVIDER,
  MessageBrokerConfigProvider,
} from './message-broker-config.provider';

export interface MessageBrokerConfigModuleOptions {
  /**
   * Cấu hình mặc định cho tất cả các service
   */
  defaultConfig?: IMessageBrokerConfig;

  /**
   * Cấu hình cho từng service cụ thể
   * Key là tên service, value là config riêng của service đó
   */
  serviceConfigs?: Record<string, Partial<IMessageBrokerConfig>>;

  /**
   * Có sử dụng config từ environment variables không
   * Mặc định: true
   */
  useEnvConfig?: boolean;
}

/**
 * Message Broker Config Module
 * Sử dụng DynamicModule để cho phép cấu hình linh hoạt
 */
@Module({})
export class MessageBrokerConfigModule {
  /**
   * Tạo module với cấu hình tùy chỉnh
   */
  static forRoot(options?: MessageBrokerConfigModuleOptions): DynamicModule {
    const providers: Provider[] = [];

    // Tạo provider cho config nếu có
    if (options?.defaultConfig) {
      providers.push({
        provide: MESSAGE_BROKER_CONFIG,
        useValue: options.defaultConfig,
      });
    }

    // Tạo provider cho config provider
    providers.push({
      provide: MESSAGE_BROKER_CONFIG_PROVIDER,
      useFactory: (configService: ConfigService, injectedConfig?: IMessageBrokerConfig) => {
        const provider = new MessageBrokerConfigProvider(configService, injectedConfig);

        // Đăng ký config cho các service cụ thể nếu có
        if (options?.serviceConfigs) {
          Object.entries(options.serviceConfigs).forEach(([serviceName, config]) => {
            provider.registerServiceConfig(serviceName, config);
          });
        }

        return provider;
      },
      inject: [ConfigService, ...(options?.defaultConfig ? [MESSAGE_BROKER_CONFIG] : [])],
    });

    // Export provider để các module khác có thể sử dụng
    providers.push({
      provide: MessageBrokerConfigProvider,
      useExisting: MESSAGE_BROKER_CONFIG_PROVIDER,
    });

    return {
      module: MessageBrokerConfigModule,
      imports: [ConfigModule],
      providers,
      exports: [MESSAGE_BROKER_CONFIG_PROVIDER, MessageBrokerConfigProvider],
      global: true, // Global module để có thể sử dụng ở bất kỳ đâu
    };
  }

  /**
   * Tạo module với cấu hình mặc định (chỉ dùng env vars)
   */
  static forRootAsync(options?: {
    useFactory?: (
      ...args: any[]
    ) => Promise<MessageBrokerConfigModuleOptions> | MessageBrokerConfigModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const providers: Provider[] = [];

    // Provider cho config (nếu có từ factory)
    if (options?.useFactory) {
      providers.push({
        provide: MESSAGE_BROKER_CONFIG,
        useFactory: async (...args: any[]) => {
          const moduleOptions = await options.useFactory!(...args);
          return moduleOptions.defaultConfig;
        },
        inject: options.inject || [],
      });
    }

    // Provider cho config provider
    providers.push({
      provide: MESSAGE_BROKER_CONFIG_PROVIDER,
      useFactory: async (
        configService: ConfigService,
        injectedConfig?: IMessageBrokerConfig,
        ...factoryArgs: any[]
      ) => {
        const provider = new MessageBrokerConfigProvider(configService, injectedConfig);

        // Load config từ factory nếu có
        if (options?.useFactory) {
          const moduleOptions = await options.useFactory(...factoryArgs);
          if (moduleOptions.serviceConfigs) {
            Object.entries(moduleOptions.serviceConfigs).forEach(([serviceName, config]) => {
              provider.registerServiceConfig(serviceName, config);
            });
          }
        }

        return provider;
      },
      inject: [
        ConfigService,
        ...(options?.useFactory ? [MESSAGE_BROKER_CONFIG] : []),
        ...(options?.inject || []),
      ],
    });

    providers.push({
      provide: MessageBrokerConfigProvider,
      useExisting: MESSAGE_BROKER_CONFIG_PROVIDER,
    });

    return {
      module: MessageBrokerConfigModule,
      imports: [ConfigModule],
      providers,
      exports: [MESSAGE_BROKER_CONFIG_PROVIDER, MessageBrokerConfigProvider],
      global: true,
    };
  }
}
