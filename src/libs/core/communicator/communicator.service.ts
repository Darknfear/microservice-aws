import { Inject, Injectable, Optional } from '@nestjs/common';
import type { IMessageBrokerConfigProvider } from '../../message-broker/message-broker-config.provider';
import {
  MESSAGE_BROKER_CONFIG,
  MESSAGE_BROKER_CONFIG_PROVIDER,
} from '../../message-broker/message-broker-config.provider';
import type { IMessageBrokerConfig } from './communicator.type';

/**
 * Communicator Service
 * Sử dụng DI để inject config từ MessageBrokerConfigProvider
 */
@Injectable()
export class CommunicatorService {
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
    // Init connection based on config
  }

  /**
   * Lấy cấu hình hiện tại
   */
  getConfig(): IMessageBrokerConfig {
    return this.config;
  }

  /**
   * Cập nhật cấu hình động
   */
  updateConfig(config: Partial<IMessageBrokerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Lấy cấu hình từ provider (có thể khác với config hiện tại)
   */
  getConfigFromProvider(serviceName?: string): IMessageBrokerConfig {
    return this.configProvider.getConfig(serviceName);
  }
}
