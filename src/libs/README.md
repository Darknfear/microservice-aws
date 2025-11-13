# Shared Libraries - Reusable Components

**Shared libraries để sử dụng across all microservices**

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Core Base Classes](#core-base-classes)
3. [JWT Service](#jwt-service)
4. [Message Broker](#message-broker)
5. [AWS Service](#aws-service)
6. [Usage Examples](#usage-examples)

---

## 🎯 Overview

Thư mục `src/libs/` chứa các shared libraries được sử dụng chung bởi tất cả microservices:

```
libs/
├── core/                    # Core utilities
│   ├── base/                # Base classes (Entity, Repository, Usecase)
│   ├── configuration/       # Configuration module
│   ├── communicator/        # Inter-service communication
│   └── apps/                # App bootstrapper
│
├── jwt/                     # JWT service
│   ├── jwt.service.ts
│   └── jwt.module.ts
│
├── message-broker/          # Message broker abstraction
│   ├── message-broker.service.ts
│   └── message-broker.module.ts
│
└── aws/                     # AWS SDK wrapper
    ├── aws.service.ts
    └── aws.module.ts
```

---

## 🧱 Core Base Classes

### BaseEntity

**Purpose**: Base class cho tất cả domain entities với Event Sourcing support

```typescript
import { BaseEntity, DomainEvent } from '@/libs/core/base';

export class UserAggregate extends BaseEntity<Record<string, unknown>> {
  username: string;
  email: string;

  // Add domain events
  recordSignIn() {
    const event = new UserSignedInEvent(this.id, this.version);
    this.addEvent(event); // ← From BaseEntity
    this.incrementVersion();
  }

  // Get uncommitted events
  getEvents() {
    return this.getUncommittedEvents(); // ← From BaseEntity
  }
}
```

**Features**:

- `id`, `createdAt`, `updatedAt`, `version` properties
- `addEvent(event)` - Add domain event
- `getUncommittedEvents()` - Get events not yet persisted
- `markEventsAsCommitted()` - Mark events as saved
- `incrementVersion()` - Increment version for optimistic locking
- `isNew()` - Check if entity is new
- `touch()` - Update `updatedAt`
- `equals(other)` - Compare entities
- `toObject()` - Serialize to plain object

---

### DomainEvent

**Purpose**: Base class cho tất cả domain events

```typescript
import { DomainEvent } from '@/libs/core/base';

export class UserSignedInEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly username: string,
    public readonly ipAddress?: string,
  ) {
    super(aggregateId, version);
    this.eventType = 'UserSignedInEvent';
  }
}
```

**Properties**:

- `eventType` - Event name
- `aggregateId` - ID của aggregate
- `timestamp` - Event timestamp
- `version` - Event version
- `metadata` - Additional metadata

---

### BaseRepository

**Purpose**: Base interface và abstract class cho repositories

```typescript
import { BaseRepository } from '@/libs/core/base';

export class UserRepository extends BaseRepository<User> {
  // Implement abstract methods
  async findById(id: string): Promise<User | null> {
    const entity = await this.ormRepo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const ormEntity = this.toOrm(user);
    const saved = await this.ormRepo.save(ormEntity);
    return this.toDomain(saved);
  }
}
```

**Methods**:

- `findById(id)` - Find by ID
- `findAll()` - Find all
- `save(entity)` - Save entity
- `saveMany(entities)` - Save multiple
- `delete(id)` - Delete by ID
- `exists(id)` - Check existence
- `count()` - Count entities

---

### BaseUsecase

**Purpose**: Base class cho usecases với lifecycle hooks

```typescript
import { BaseUsecase } from '@/libs/core/base';

export class SignInUsecase extends BaseUsecase<SignInRequest, SignInResponse> {
  async execute(request: SignInRequest): Promise<SignInResponse> {
    return this.executeWithHooks(request, async (req) => {
      // Main logic here
      const user = await this.userRepo.findByUsername(req.username);
      // ...
      return { userId: user.id };
    });
  }

  // Lifecycle hooks
  protected validate(request: SignInRequest): void {
    if (!request.username) throw new Error('Username required');
  }

  protected async beforeExecute(request: SignInRequest): Promise<void> {
    console.log('Starting sign-in...');
  }

  protected async afterExecute(response: SignInResponse): Promise<void> {
    console.log(`User ${response.userId} signed in`);
  }

  protected handleError(error: Error): void {
    console.error('Sign-in failed:', error);
  }
}
```

**Hooks**:

- `validate(request)` - Validate request
- `beforeExecute(request)` - Before execution
- `afterExecute(response)` - After execution
- `handleError(error)` - Error handling
- `executeWithHooks(request, fn)` - Execute with all hooks

---

## 🔐 JWT Service

**Purpose**: JWT token generation và verification

### Installation

```typescript
// Import module
import { JwtModule } from '@/libs/jwt/jwt.module';

@Module({
  imports: [JwtModule],
})
export class AuthModule {}
```

### Usage

```typescript
import { JwtService } from '@/libs/jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signIn(user: User) {
    // Generate access + refresh tokens
    const tokens = await this.jwtService.generateTokens({
      userId: user.id,
      username: user.username,
      role: 'user',
    });

    return {
      accessToken: tokens.accessToken, // Expires in 15m
      refreshToken: tokens.refreshToken, // Expires in 7d
      expiresIn: tokens.expiresIn, // 900 (seconds)
    };
  }

  async verifyToken(token: string) {
    // Verify and decode token
    const payload = await this.jwtService.verifyAccessToken(token);
    return payload; // { userId, username, role, iat, exp }
  }

  async refreshTokens(refreshToken: string) {
    // Verify refresh token
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    // Generate new tokens
    return this.jwtService.generateTokens({
      userId: payload.userId,
      username: payload.username,
    });
  }
}
```

### Methods

| Method                          | Description                      |
| ------------------------------- | -------------------------------- |
| `generateTokens(payload)`       | Generate access + refresh tokens |
| `generateAccessToken(payload)`  | Generate access token (15m)      |
| `generateRefreshToken(payload)` | Generate refresh token (7d)      |
| `verifyAccessToken(token)`      | Verify and decode access token   |
| `verifyRefreshToken(token)`     | Verify and decode refresh token  |
| `decodeToken(token)`            | Decode without verification      |

### Configuration

```bash
# Environment variables
JWT_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

---

## 📨 Message Broker

**Purpose**: Event publishing abstraction (RabbitMQ, Kafka, SQS)

### Installation

```typescript
import { MessageBrokerModule } from '@/libs/message-broker/message-broker.module';

@Module({
  imports: [MessageBrokerModule],
})
export class AuthModule {}
```

### Usage

```typescript
import { MessageBrokerService, MessageEvent } from '@/libs/message-broker/message-broker.service';

@Injectable()
export class EventBusService {
  constructor(private readonly messageBroker: MessageBrokerService) {}

  async publishEvent(event: DomainEvent) {
    const messageEvent: MessageEvent = {
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      timestamp: event.timestamp,
      data: event.toObject(),
      version: event.version,
    };

    await this.messageBroker.publish(messageEvent);
  }

  subscribeToEvents() {
    this.messageBroker.subscribe('UserSignedInEvent', async (event) => {
      console.log('User signed in:', event.data);
      // Handle event...
    });
  }
}
```

### Methods

| Method                          | Description                  |
| ------------------------------- | ---------------------------- |
| `publish(event)`                | Publish event to broker      |
| `subscribe(eventType, handler)` | Subscribe to event type      |
| `emitLocal(event)`              | Emit event locally (testing) |
| `getBrokerType()`               | Get configured broker type   |

### Configuration

```bash
# Environment variables
MESSAGE_BROKER_TYPE=rabbitmq  # or kafka, sqs

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Kafka
KAFKA_BROKERS=localhost:9092

# AWS SQS
AWS_REGION=us-east-1
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
```

### Supported Brokers

- **RabbitMQ** - Lightweight message broker
- **Kafka** - High-throughput distributed streaming
- **AWS SQS** - Fully managed queue service

---

## ☁️ AWS Service

**Purpose**: AWS SDK wrapper for S3, SQS, SNS, SES

### Installation

```typescript
import { AwsModule } from '@/libs/aws/aws.module';

@Module({
  imports: [AwsModule],
})
export class StorageModule {}
```

### Usage

#### S3 Operations

```typescript
import { AwsService } from '@/libs/aws/aws.service';

@Injectable()
export class FileService {
  constructor(private readonly awsService: AwsService) {}

  async uploadFile(file: Buffer, filename: string) {
    const result = await this.awsService.uploadToS3({
      bucket: 'my-bucket',
      key: `uploads/${filename}`,
      body: file,
      contentType: 'image/jpeg',
    });

    return result.url;
  }

  async downloadFile(key: string) {
    const buffer = await this.awsService.downloadFromS3('my-bucket', key);
    return buffer;
  }

  async deleteFile(key: string) {
    await this.awsService.deleteFromS3('my-bucket', key);
  }
}
```

#### SQS Operations

```typescript
async sendMessage(message: any) {
  await this.awsService.sendToSQS({
    queueUrl: 'https://sqs.us-east-1.amazonaws.com/...',
    messageBody: JSON.stringify(message),
    delaySeconds: 0,
  });
}

async receiveMessages() {
  const messages = await this.awsService.receiveFromSQS(
    'https://sqs.us-east-1.amazonaws.com/...',
    10  // Max 10 messages
  );

  for (const msg of messages) {
    console.log('Message:', msg.body);
    // Delete after processing
    await this.awsService.deleteFromSQS(queueUrl, msg.receiptHandle);
  }
}
```

#### SNS Operations

```typescript
async publishNotification(topic: string, message: string) {
  await this.awsService.publishToSNS({
    topicArn: 'arn:aws:sns:us-east-1:...',
    message: message,
    subject: 'Notification',
  });
}
```

#### SES Operations

```typescript
async sendEmail(to: string, subject: string, content: string) {
  await this.awsService.sendEmail(
    to,
    subject,
    `<html><body>${content}</body></html>`
  );
}
```

### Methods

| Service | Method                            | Description           |
| ------- | --------------------------------- | --------------------- |
| S3      | `uploadToS3(options, body)`       | Upload file to S3     |
| S3      | `downloadFromS3(bucket, key)`     | Download file from S3 |
| S3      | `deleteFromS3(bucket, key)`       | Delete file from S3   |
| SQS     | `sendToSQS(options)`              | Send message to queue |
| SQS     | `receiveFromSQS(queueUrl, max)`   | Receive messages      |
| SQS     | `deleteFromSQS(queueUrl, handle)` | Delete message        |
| SNS     | `publishToSNS(options)`           | Publish to topic      |
| SES     | `sendEmail(to, subject, html)`    | Send email            |

### Configuration

```bash
# Environment variables
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3
AWS_S3_BUCKET=my-bucket

# SQS
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...

# SNS
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:...

# SES
AWS_SES_FROM_EMAIL=noreply@example.com
```

---

## 💡 Usage Examples

### Example 1: Create Domain Entity with Events

```typescript
import { BaseEntity, DomainEvent } from '@/libs/core/base';

// Define event
export class OrderCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly customerId: string,
    public readonly totalAmount: number,
  ) {
    super(aggregateId, version);
    this.eventType = 'OrderCreatedEvent';
  }
}

// Define aggregate
export class OrderAggregate extends BaseEntity<Record<string, unknown>> {
  customerId: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped';

  static create(customerId: string, totalAmount: number): OrderAggregate {
    const order = new OrderAggregate();
    order.customerId = customerId;
    order.totalAmount = totalAmount;
    order.status = 'pending';

    // Add event
    const event = new OrderCreatedEvent(order.id, order.version, customerId, totalAmount);
    order.addEvent(event);
    order.incrementVersion();

    return order;
  }
}
```

---

### Example 2: Create Usecase with Lifecycle Hooks

```typescript
import { BaseUsecase } from '@/libs/core/base';

export class CreateOrderUsecase extends BaseUsecase<CreateOrderRequest, CreateOrderResponse> {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly paymentService: IPaymentService,
  ) {
    super();
  }

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.executeWithHooks(request, async (req) => {
      // Create order aggregate
      const order = OrderAggregate.create(req.customerId, req.totalAmount);

      // Save to repository
      await this.orderRepo.save(order);

      // Process payment
      const payment = await this.paymentService.charge(order.totalAmount);

      return {
        orderId: order.id,
        paymentId: payment.id,
        status: 'success',
      };
    });
  }

  protected validate(request: CreateOrderRequest): void {
    if (request.totalAmount <= 0) {
      throw new Error('Amount must be positive');
    }
  }

  protected async afterExecute(response: CreateOrderResponse): Promise<void> {
    console.log(`Order ${response.orderId} created successfully`);
  }
}
```

---

### Example 3: Publish Events via Message Broker

```typescript
import { MessageBrokerService } from '@/libs/message-broker/message-broker.service';

@Injectable()
export class OrderEventPublisher {
  constructor(private readonly messageBroker: MessageBrokerService) {}

  async publishOrderCreated(order: OrderAggregate) {
    const events = order.getUncommittedEvents();

    for (const event of events) {
      await this.messageBroker.publish({
        eventType: event.eventType,
        aggregateId: order.id,
        timestamp: event.timestamp,
        data: event.toObject(),
        version: event.version,
      });
    }

    order.markEventsAsCommitted();
  }
}

// Other service listens
@Injectable()
export class NotificationService {
  constructor(private readonly messageBroker: MessageBrokerService) {
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    this.messageBroker.subscribe('OrderCreatedEvent', async (event) => {
      // Send email notification
      await this.sendOrderConfirmationEmail(event.data);
    });
  }
}
```

---

### Example 4: File Upload to S3

```typescript
import { AwsService } from '@/libs/aws/aws.service';

@Injectable()
export class ProductImageService {
  constructor(private readonly awsService: AwsService) {}

  async uploadProductImage(productId: string, imageBuffer: Buffer) {
    const key = `products/${productId}/image.jpg`;

    // Upload to S3
    const result = await this.awsService.uploadToS3({
      bucket: 'product-images',
      key,
      body: imageBuffer,
      contentType: 'image/jpeg',
    });

    return {
      url: result.url,
      key,
    };
  }

  async getProductImage(productId: string) {
    const key = `products/${productId}/image.jpg`;
    const buffer = await this.awsService.downloadFromS3('product-images', key);
    return buffer;
  }
}
```

---

## 📋 Best Practices

### 1. Always Use Interfaces

```typescript
// ✅ GOOD: Define interface
export interface IUserRepository extends IBaseRepository<User> {
  findByUsername(username: string): Promise<User | null>;
}

// Implement interface
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  async findByUsername(username: string): Promise<User | null> {
    // ...
  }
}
```

### 2. Extend Base Classes

```typescript
// ✅ GOOD: Extend BaseEntity
export class UserAggregate extends BaseEntity<Record<string, unknown>> {
  // Inherit event sourcing capabilities
}

// ✅ GOOD: Extend BaseUsecase
export class SignInUsecase extends BaseUsecase<SignInRequest, SignInResponse> {
  // Inherit lifecycle hooks
}
```

### 3. Use Dependency Injection

```typescript
// ✅ GOOD: Inject services
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly messageBroker: MessageBrokerService,
    private readonly awsService: AwsService,
  ) {}
}
```

---

## 🤝 Contributing

Khi thêm shared library mới:

1. Create folder trong `src/libs/`
2. Create `.service.ts` và `.module.ts`
3. Export từ module
4. Add documentation vào file này
5. Add usage examples

---

**Shared Libraries - Reusable components cho all microservices** 🚀
