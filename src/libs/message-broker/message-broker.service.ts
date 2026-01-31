/**
 * Message Broker Service
 * Shared library for event publishing and subscribing
 * Supports multiple brokers: RabbitMQ, Kafka, SQS
 *
 * Responsibilities:
 * - Publish events to message broker
 * - Subscribe to events
 * - Handle message routing
 * - Manage message acknowledgment
 */

import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
  Optional,
} from '@nestjs/common';
import type { IMessageBrokerConfig } from '../core/communicator/communicator.type';
import {
  type IMessageBrokerConfigProvider,
  MESSAGE_BROKER_CONFIG,
  MESSAGE_BROKER_CONFIG_PROVIDER,
} from './message-broker-config.provider';

export enum BrokerType {
  RABBITMQ = 'rabbitmq',
  KAFKA = 'kafka',
  SQS = 'sqs',
  NATS = 'nats',
  REDIS = 'redis',
}

export interface MessageEvent {
  eventType: string;
  aggregateId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  version?: number;
}

export type SubscriptionHandler = (message: MessageEvent) => Promise<void>;

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private brokerType: BrokerType;
  private brokerClient: unknown;
  private subscriptions: Map<string, SubscriptionHandler[]>;
  private config: IMessageBrokerConfig;

  constructor(
    @Inject(MESSAGE_BROKER_CONFIG_PROVIDER)
    private readonly configProvider: IMessageBrokerConfigProvider,
    @Optional() @Inject(MESSAGE_BROKER_CONFIG) private readonly directConfig?: IMessageBrokerConfig,
    @Optional() private readonly serviceName?: string,
  ) {
    // Ưu tiên directConfig nếu có, sau đó lấy từ provider
    if (this.directConfig) {
      this.config = this.directConfig;
    } else {
      this.config = this.configProvider.getConfig(this.serviceName);
    }

    // Xác định broker type từ config
    if (this.config.protocol) {
      this.brokerType = this.config.protocol as BrokerType;
    } else {
      this.brokerType = (process.env.MESSAGE_BROKER_TYPE as BrokerType) ?? BrokerType.RABBITMQ;
    }

    this.subscriptions = new Map();
  }

  /**
   * Initialize message broker connection
   */
  onModuleInit(): void {
    this.connect();
  }

  /**
   * Close message broker connection
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Connect to the message broker
   */
  private connect(): void {
    switch (this.brokerType) {
      case BrokerType.RABBITMQ:
        this.connectRabbitMQ();
        break;
      case BrokerType.KAFKA:
        this.connectKafka();
        break;
      case BrokerType.SQS:
        this.connectSQS();
        break;
      case BrokerType.NATS:
        this.connectNATS();
        break;
      case BrokerType.REDIS:
        this.connectRedis();
        break;
      default:
        throw new Error(`Unknown broker type: ${String(this.brokerType)}`);
    }
  }

  /**
   * Disconnect from the message broker
   */
  private async disconnect(): Promise<void> {
    // Implementation depends on broker type
    // For now, just a placeholder
  }

  /**
   * Connect to RabbitMQ
   */
  private connectRabbitMQ(): void {
    // TODO: Implement RabbitMQ connection
    // Use amqplib package
    console.warn('Connecting to RabbitMQ...');
  }

  /**
   * Connect to Kafka
   */
  private connectKafka(): void {
    // TODO: Implement Kafka connection
    // Use kafkajs package
    console.warn('Connecting to Kafka...');
  }

  /**
   * Connect to AWS SQS
   */
  private connectSQS(): void {
    // TODO: Implement SQS connection
    // Use AWS SDK
    console.warn('Connecting to AWS SQS...', {
      brokers: this.config.brokers,
      clientId: this.config.clientId,
    });
  }

  /**
   * Connect to NATS
   */
  private connectNATS(): void {
    // TODO: Implement NATS connection
    // Use nats package
    console.warn('Connecting to NATS...', {
      servers: this.config.nats?.servers ?? this.config.brokers,
      clientId: this.config.clientId,
      jetstream: this.config.nats?.jetstream,
    });
  }

  /**
   * Connect to Redis
   */
  private connectRedis(): void {
    // TODO: Implement Redis connection
    // Use ioredis package
    console.warn('Connecting to Redis...', {
      brokers: this.config.brokers,
      clientId: this.config.clientId,
    });
  }

  /**
   * Publish an event to the message broker
   */
  async publish(event: MessageEvent): Promise<void> {
    console.warn(`Publishing event: ${event.eventType}`, event);

    switch (this.brokerType) {
      case BrokerType.RABBITMQ:
        await this.publishToRabbitMQ(event);
        break;
      case BrokerType.KAFKA:
        await this.publishToKafka(event);
        break;
      case BrokerType.SQS:
        await this.publishToSQS(event);
        break;
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(eventType: string, handler: SubscriptionHandler): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const handlers = this.subscriptions.get(eventType);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Publish to RabbitMQ
   */
  private async publishToRabbitMQ(_event: MessageEvent): Promise<void> {
    // TODO: Implement RabbitMQ publish
  }

  /**
   * Publish to Kafka
   */
  private async publishToKafka(_event: MessageEvent): Promise<void> {
    // TODO: Implement Kafka publish
  }

  /**
   * Publish to SQS
   */
  private async publishToSQS(_event: MessageEvent): Promise<void> {
    // TODO: Implement SQS publish
  }

  /**
   * Get broker type
   */
  getBrokerType(): BrokerType {
    return this.brokerType;
  }

  /**
   * Get current configuration
   */
  getConfig(): IMessageBrokerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(config: Partial<IMessageBrokerConfig>): void {
    this.config = { ...this.config, ...config };
    // Có thể cần reconnect nếu config thay đổi quan trọng
  }

  /**
   * Emit event locally for testing
   */
  async emitLocal(event: MessageEvent): Promise<void> {
    const handlers = this.subscriptions.get(event.eventType) ?? [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
