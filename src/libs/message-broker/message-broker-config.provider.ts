/**
 * Message Broker Config Provider
 * Sử dụng IOC/DI để cung cấp cấu hình nâng cao cho các service
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IMessageBrokerConfig } from '../core/communicator/communicator.type';

/**
 * Interface cho Message Broker Config Provider
 * Cho phép các service khác nhau có config riêng biệt
 */
export interface IMessageBrokerConfigProvider {
  /**
   * Lấy cấu hình message broker cho service hiện tại
   * @param serviceName Tên service (optional, để override config mặc định)
   */
  getConfig(serviceName?: string): IMessageBrokerConfig;

  /**
   * Lấy cấu hình mặc định
   */
  getDefaultConfig(): IMessageBrokerConfig;

  /**
   * Lấy cấu hình cho một service cụ thể
   */
  getServiceConfig(serviceName: string): IMessageBrokerConfig;
}

/**
 * Token để inject config provider
 */
export const MESSAGE_BROKER_CONFIG_PROVIDER = Symbol('MESSAGE_BROKER_CONFIG_PROVIDER');

/**
 * Token để inject config trực tiếp
 */
export const MESSAGE_BROKER_CONFIG = Symbol('MESSAGE_BROKER_CONFIG');

/**
 * Implementation của Message Broker Config Provider
 * Sử dụng ConfigService để load config từ environment variables
 */
@Injectable()
export class MessageBrokerConfigProvider implements IMessageBrokerConfigProvider {
  private defaultConfig: IMessageBrokerConfig;
  private serviceConfigs = new Map<string, IMessageBrokerConfig>();

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject(MESSAGE_BROKER_CONFIG)
    private readonly injectedConfig?: IMessageBrokerConfig,
  ) {
    this.defaultConfig = this.loadDefaultConfig();
    this.loadServiceConfigs();
  }

  /**
   * Load cấu hình mặc định từ environment variables
   */
  private loadDefaultConfig(): IMessageBrokerConfig {
    const config: IMessageBrokerConfig = {
      clientId: this.configService.get<string>('MESSAGE_BROKER_CLIENT_ID'),
      brokers: this.configService.get<string>('MESSAGE_BROKER_BROKERS')?.split(',') || [],
      protocol: this.configService.get<string>('MESSAGE_BROKER_PROTOCOL') as any,
      serializer: this.configService.get<string>('MESSAGE_BROKER_SERIALIZER') || 'json',
      requestTimeoutMs: this.configService.get<number>('MESSAGE_BROKER_REQUEST_TIMEOUT_MS'),
      prefetch: this.configService.get<number>('MESSAGE_BROKER_PREFETCH'),
      maxInFlight: this.configService.get<number>('MESSAGE_BROKER_MAX_IN_FLIGHT'),
      ackMode: this.configService.get<string>('MESSAGE_BROKER_ACK_MODE') as any,
    };

    // Load authentication config
    if (this.configService.get<string>('MESSAGE_BROKER_AUTH_USERNAME')) {
      config.auth = {
        username: this.configService.get<string>('MESSAGE_BROKER_AUTH_USERNAME'),
        password: this.configService.get<string>('MESSAGE_BROKER_AUTH_PASSWORD'),
        token: this.configService.get<string>('MESSAGE_BROKER_AUTH_TOKEN'),
        sasl: {
          mechanism: this.configService.get<string>('MESSAGE_BROKER_SASL_MECHANISM') as any,
          username: this.configService.get<string>('MESSAGE_BROKER_SASL_USERNAME'),
          password: this.configService.get<string>('MESSAGE_BROKER_SASL_PASSWORD'),
        },
      };
    }

    // Load TLS config
    if (this.configService.get<boolean>('MESSAGE_BROKER_TLS_ENABLED')) {
      config.tls = {
        enabled: true,
        ca: this.configService.get<string>('MESSAGE_BROKER_TLS_CA'),
        cert: this.configService.get<string>('MESSAGE_BROKER_TLS_CERT'),
        key: this.configService.get<string>('MESSAGE_BROKER_TLS_KEY'),
        rejectUnauthorized: this.configService.get<boolean>(
          'MESSAGE_BROKER_TLS_REJECT_UNAUTHORIZED',
        ),
      };
    }

    // Load reconnect config
    if (this.configService.get<number>('MESSAGE_BROKER_RECONNECT_RETRIES')) {
      config.reconnect = {
        retries: this.configService.get<number>('MESSAGE_BROKER_RECONNECT_RETRIES'),
        initialDelayMs: this.configService.get<number>('MESSAGE_BROKER_RECONNECT_INITIAL_DELAY_MS'),
        maxDelayMs: this.configService.get<number>('MESSAGE_BROKER_RECONNECT_MAX_DELAY_MS'),
        factor: this.configService.get<number>('MESSAGE_BROKER_RECONNECT_FACTOR'),
      };
    }

    // Load retry config
    if (this.configService.get<number>('MESSAGE_BROKER_RETRY_ATTEMPTS')) {
      config.retry = {
        attempts: this.configService.get<number>('MESSAGE_BROKER_RETRY_ATTEMPTS'),
        delayMs: this.configService.get<number>('MESSAGE_BROKER_RETRY_DELAY_MS'),
        factor: this.configService.get<number>('MESSAGE_BROKER_RETRY_FACTOR'),
      };
    }

    // Load Kafka-specific config
    if (this.configService.get<string>('MESSAGE_BROKER_KAFKA_ACKS')) {
      config.kafka = {
        acks: this.configService.get<string>('MESSAGE_BROKER_KAFKA_ACKS') as any,
        compression: this.configService.get<string>('MESSAGE_BROKER_KAFKA_COMPRESSION') as any,
        clientId: this.configService.get<string>('MESSAGE_BROKER_KAFKA_CLIENT_ID'),
      };
    }

    // Load NATS-specific config
    if (this.configService.get<string>('MESSAGE_BROKER_NATS_SERVERS')) {
      config.nats = {
        servers: this.configService.get<string>('MESSAGE_BROKER_NATS_SERVERS')?.split(',') || [],
        jetstream: this.configService.get<boolean>('MESSAGE_BROKER_NATS_JETSTREAM'),
      };
    }

    // Load RabbitMQ-specific config
    if (this.configService.get<string>('MESSAGE_BROKER_RABBITMQ_URL')) {
      config.rabbitmq = {
        url: this.configService.get<string>('MESSAGE_BROKER_RABBITMQ_URL'),
        prefetch: this.configService.get<number>('MESSAGE_BROKER_RABBITMQ_PREFETCH'),
      };
    }

    // Merge với injected config nếu có
    if (this.injectedConfig) {
      return this.mergeConfig(config, this.injectedConfig);
    }

    return config;
  }

  /**
   * Load cấu hình cho các service cụ thể
   * Format: MESSAGE_BROKER_{SERVICE_NAME}_{CONFIG_KEY}
   */
  private loadServiceConfigs(): void {
    // Có thể mở rộng để load config cho từng service từ env vars
    // Ví dụ: MESSAGE_BROKER_AUTH_SERVICE_BROKERS, MESSAGE_BROKER_USER_SERVICE_BROKERS
  }

  /**
   * Merge hai config objects, ưu tiên config thứ hai
   */
  private mergeConfig(
    base: IMessageBrokerConfig,
    override: IMessageBrokerConfig,
  ): IMessageBrokerConfig {
    return {
      ...base,
      ...override,
      auth: override.auth ? { ...base.auth, ...override.auth } : base.auth,
      tls: override.tls ? { ...base.tls, ...override.tls } : base.tls,
      reconnect: override.reconnect ? { ...base.reconnect, ...override.reconnect } : base.reconnect,
      retry: override.retry ? { ...base.retry, ...override.retry } : base.retry,
      kafka: override.kafka ? { ...base.kafka, ...override.kafka } : base.kafka,
      nats: override.nats ? { ...base.nats, ...override.nats } : base.nats,
      rabbitmq: override.rabbitmq ? { ...base.rabbitmq, ...override.rabbitmq } : base.rabbitmq,
    };
  }

  /**
   * Lấy cấu hình cho service hiện tại
   */
  getConfig(serviceName?: string): IMessageBrokerConfig {
    if (serviceName) {
      return this.getServiceConfig(serviceName);
    }
    return this.getDefaultConfig();
  }

  /**
   * Lấy cấu hình mặc định
   */
  getDefaultConfig(): IMessageBrokerConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Lấy cấu hình cho một service cụ thể
   * Nếu không có config riêng, trả về config mặc định
   */
  getServiceConfig(serviceName: string): IMessageBrokerConfig {
    const serviceConfig = this.serviceConfigs.get(serviceName);
    if (serviceConfig) {
      return this.mergeConfig(this.defaultConfig, serviceConfig);
    }
    return this.getDefaultConfig();
  }

  /**
   * Đăng ký cấu hình cho một service cụ thể
   * Có thể được gọi từ module configuration
   */
  registerServiceConfig(serviceName: string, config: Partial<IMessageBrokerConfig>): void {
    const existingConfig = this.serviceConfigs.get(serviceName) || {};
    this.serviceConfigs.set(
      serviceName,
      this.mergeConfig(existingConfig, config as IMessageBrokerConfig),
    );
  }
}
