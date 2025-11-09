/**
 * Generic message broker configuration used across services.
 * This interface is intentionally broker-agnostic and contains common
 * options plus optional broker-specific sub-objects (kafka, nats, etc.).
 * All fields are optional so the same type can be reused for different brokers.
 */
export interface IMessageBrokerConfig {
  // Logical client identifier (useful for Kafka clientId, NATS name, tracing)
  clientId?: string;

  // Brokers / bootstrap servers list (e.g. ['kafka:9092'] or ['nats://nats:4222'])
  brokers?: string[];

  // Protocol hint (optional) to allow selecting broker-specific handling
  protocol?: 'kafka' | 'nats' | 'redis' | 'rabbitmq' | string;

  // Generic authentication options
  auth?: {
    username?: string;
    password?: string;
    // token-based auth (e.g. NATS token, JWT)
    token?: string;
    // SASL options for Kafka etc.
    sasl?: {
      mechanism?: 'plain' | 'scram-sha-256' | 'scram-sha-512' | string;
      username?: string;
      password?: string;
    };
  };

  // TLS/SSL options (if applicable)
  tls?: {
    enabled?: boolean;
    // PEM contents or path depending on loader in your app
    ca?: string;
    cert?: string;
    key?: string;
    rejectUnauthorized?: boolean;
  };

  // Serializer used for messages (affects how payloads are encoded/decoded)
  serializer?: 'json' | 'msgpack' | 'avro' | string;

  // Request/response timeout for sync RPC patterns (ms)
  requestTimeoutMs?: number;

  // Retry / reconnect strategy
  reconnect?: {
    retries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    factor?: number; // exponential backoff factor
  };

  // Consumer / client tuning
  prefetch?: number; // concurrency / prefetch for consumers
  maxInFlight?: number; // maximum in-flight messages
  ackMode?: 'auto' | 'manual';

  // Broker specific options grouped under named keys
  kafka?: {
    acks?: number | 'all' | 'none';
    compression?: 'gzip' | 'snappy' | 'lz4' | 'none' | string;
    clientId?: string;
    // any additional kafka-js options
    clientOptions?: Record<string, any>;
  };

  nats?: {
    servers?: string[];
    // whether to enable JetStream features
    jetstream?: boolean;
    // any additional nats options
    options?: Record<string, any>;
  };

  rabbitmq?: {
    // connection string like amqp://user:pass@host:5672
    url?: string;
    prefetch?: number;
    queueOptions?: Record<string, any>;
  };

  // Retry policy for message handling (application-level)
  retry?: {
    attempts?: number;
    delayMs?: number;
    factor?: number;
  };

  // Free-form holder for any other provider-specific options
  clientOptions?: Record<string, any>;
}
