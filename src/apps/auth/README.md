# Auth Service - CQRS + Event Sourcing Implementation

**Complete authentication service với Clean Architecture, CQRS, và Event Sourcing patterns**

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [CQRS Flow](#cqrs-flow)
4. [API Endpoints](#api-endpoints)
5. [Domain Model](#domain-model)
6. [Database Setup](#database-setup)
7. [Development](#development)
8. [Testing](#testing)

---

## 🎯 Overview

Auth Service là microservice xử lý authentication và authorization với các features:

- ✅ User registration và sign-in
- ✅ Auto account lockout (5 failed attempts)
- ✅ CQRS pattern (Command/Query separation)
- ✅ Event Sourcing (Complete audit trail)
- ✅ Two databases (Command DB + Query DB)
- ✅ Projections (Eventual consistency)
- ✅ Denormalized read models (Fast queries)

---

## 🏗️ Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│              AUTH SERVICE                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────┐    ┌────────────────────┐  │
│  │  WRITE SIDE        │    │   READ SIDE        │  │
│  │  (Commands)        │    │   (Queries)        │  │
│  └────────────────────┘    └────────────────────┘  │
│           │                          │              │
│           ▼                          ▼              │
│  ┌────────────────────┐    ┌────────────────────┐  │
│  │   Event Store      │    │   Read Models      │  │
│  │  (Command DB)      │    │   (Query DB)       │  │
│  └────────────────────┘    └────────────────────┘  │
│           │                          ▲              │
│           └──────► Projections ──────┘              │
│                (Eventual Consistency)                │
└──────────────────────────────────────────────────────┘
```

### Clean Architecture (5 Layers)

```
src/
├── cqrs/                        # CQRS Layer
│   ├── commands/                # Write intentions
│   ├── command-handlers/        # Write logic
│   ├── queries/                 # Read intentions
│   ├── query-handlers/          # Read logic
│   └── projections/             # Event handlers
│
├── domain/                      # Domain Layer (Business Rules)
│   ├── entities/
│   │   ├── user-aggregate.ts    # Event Sourcing aggregate
│   │   └── user.entity.ts       # Simple entity
│   ├── events/
│   │   └── user.events.ts       # 6 domain events
│   ├── value-objects/
│   │   ├── email.ts
│   │   └── username.ts
│   └── errors/
│       └── index.ts             # Domain errors
│
├── ports/                       # Ports Layer (Interfaces)
│   ├── repositories/
│   │   └── user.repository.interface.ts
│   ├── event-store/
│   │   └── event-store.interface.ts
│   └── services/
│       └── password.service.interface.ts
│
├── usecases/                    # Application Layer
│   ├── event-bus/
│   │   └── event-bus.service.ts  # Event orchestration
│   └── sign-in/
│       ├── sign-in.usecase.ts
│       └── event-sourcing-sign-in.usecase.ts
│
├── infra/                       # Infrastructure Layer
│   ├── event-store/
│   │   └── in-memory-event-store.ts   # Command DB
│   ├── read-models/
│   │   ├── user.read-model.ts         # Query DB
│   │   └── sign-in-history.read-model.ts
│   ├── repositories/
│   │   ├── user.orm.entity.ts
│   │   └── user.repository.ts
│   └── services/
│       └── password.service.ts
│
└── interfaces/                  # Interfaces Layer (HTTP)
    └── http/
        ├── controllers/
        │   └── auth.controller.ts
        ├── dtos/
        │   └── sign-in.dto.ts
        └── filters/
            └── domain-exception.filter.ts
```

---

## 🔄 CQRS Flow

### Write Side (Commands)

```
1. HTTP POST Request
   ↓
2. AuthController creates Command
   POST /auth/sign-in → SignInCommand
   ↓
3. CommandHandler processes
   SignInCommandHandler.execute(command)
   ↓
4. Load Aggregate from Event Store
   events = await eventStore.getEventStream(userId)
   aggregate = UserAggregate.fromEventStream(events)
   ↓
5. Execute Domain Logic
   aggregate.recordSignIn(ip, userAgent)
   → Produces UserSignedInEvent
   ↓
6. Save to Event Store (Command DB)
   await eventStore.append(userId, events)
   ↓
7. Trigger Projections (Update Query DB)
   await userProjection.onUserSignedIn(event)
   await signInHistoryProjection.onUserSignedIn(event)
   ↓
8. Return Result
   { success: true, userId, username }
```

### Read Side (Queries)

```
1. HTTP GET Request
   ↓
2. AuthController creates Query
   GET /auth/users/:id → GetUserQuery
   ↓
3. QueryHandler processes
   GetUserQueryHandler.execute(query)
   ↓
4. Query Read Model (Query DB) - Direct query, fast!
   SELECT * FROM user_read_model WHERE id = ?
   ↓
5. Return Result
   { id, username, email, totalSignIns, ... }
```

**Performance**: Queries **100x faster** than event replay!

---

## 🌐 API Endpoints

### Commands (Write Operations)

#### 1. Register User

```bash
POST /auth/register

Request:
{
  "username": "john",
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 201 Created
{
  "userId": "uuid-123",
  "username": "john",
  "email": "john@example.com",
  "message": "User created successfully"
}
```

#### 2. Sign In

```bash
POST /auth/sign-in

Request:
{
  "username": "john",
  "password": "securepass123"
}

Response: 200 OK
{
  "userId": "uuid-123",
  "username": "john",
  "email": "john@example.com",
  "isActive": true
}

Error: 401 Unauthorized (Invalid credentials)
Error: 403 Forbidden (Account locked after 5 failed attempts)
```

#### 3. Change Password

```bash
POST /auth/change-password

Request:
{
  "userId": "uuid-123",
  "currentPassword": "securepass123",
  "newPassword": "newsecurepass456"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

---

### Queries (Read Operations)

#### 1. Get User by ID

```bash
GET /auth/users/:userId

Response: 200 OK
{
  "id": "uuid-123",
  "username": "john",
  "email": "john@example.com",
  "isActive": true,
  "failedSignInAttempts": 0,
  "totalSignIns": 42,
  "lastSignInAt": "2025-11-13T10:30:00Z",
  "lastSignInIp": "192.168.1.1",
  "createdAt": "2025-11-01T00:00:00Z",
  "updatedAt": "2025-11-13T10:30:00Z"
}
```

#### 2. Get User by Username

```bash
GET /auth/users/by-username/:username

Response: 200 OK
(Same as Get User by ID)
```

#### 3. Get Sign-In History

```bash
GET /auth/users/:userId/sign-in-history?limit=10&offset=0

Response: 200 OK
{
  "userId": "uuid-123",
  "history": [
    {
      "id": "history-1",
      "userId": "uuid-123",
      "username": "john",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "createdAt": "2025-11-13T10:30:00Z"
    },
    {
      "id": "history-2",
      "userId": "uuid-123",
      "username": "john",
      "ipAddress": "192.168.1.1",
      "success": false,
      "failureReason": "Invalid credentials (attempt 1)",
      "createdAt": "2025-11-13T10:25:00Z"
    }
  ],
  "total": 2
}
```

---

## 🧩 Domain Model

### UserAggregate (Event Sourcing)

```typescript
class UserAggregate extends BaseEntity<Record<string, unknown>> {
  username: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedSignInAttempts: number;
  lastSignInAt?: Date;

  // Command methods (produce events)
  recordSignIn(ipAddress?, userAgent?): void;
  recordFailedSignInAttempt(ipAddress?): void;
  deactivate(reason?): void;
  reactivate(): void;
  changePassword(oldHash, newHash): void;

  // Reconstruction
  static fromEventStream(events: DomainEvent[]): UserAggregate;
}
```

### Domain Events (6 events)

1. **UserRegisteredEvent** - User created
2. **UserSignedInEvent** - Successful sign-in
3. **InvalidSignInAttemptEvent** - Failed sign-in
4. **UserDeactivatedEvent** - Account locked
5. **UserReactivatedEvent** - Account unlocked
6. **PasswordChangedEvent** - Password updated

### Read Models (Denormalized)

#### UserReadModel (Query DB)

```typescript
{
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedSignInAttempts: number;
  totalSignIns: number;  // ← Denormalized for performance
  lastSignInAt?: Date;
  lastSignInIp?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
```

#### SignInHistoryReadModel (Query DB)

```typescript
{
  id: string;
  userId: string;
  username: string;  // ← Denormalized
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  createdAt: Date;
  eventVersion: number;  // For idempotency
}
```

---

## 💾 Database Setup

### Two PostgreSQL Databases

#### 1. Command DB (Event Store)

```sql
-- Create database
CREATE DATABASE auth_command_db;

-- Event Store table
CREATE TABLE event_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  event_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_aggregate_id ON event_store(aggregate_id, version);
CREATE INDEX idx_event_type ON event_store(event_type);
```

**Characteristics**:

- Append-only (no updates/deletes)
- Immutable (events never change)
- Source of truth
- Complete audit trail

#### 2. Query DB (Read Models)

```sql
-- Create database
CREATE DATABASE auth_query_db;

-- User Read Model (auto-created by TypeORM)
-- SignInHistory Read Model (auto-created by TypeORM)
```

**Characteristics**:

- Denormalized (duplicate data)
- Optimized for reads
- Eventually consistent
- Can be rebuilt from Event Store

### Environment Variables

```bash
# Command DB (Event Store)
COMMAND_DB_HOST=localhost
COMMAND_DB_PORT=5432
COMMAND_DB_NAME=auth_command_db
COMMAND_DB_USER=postgres
COMMAND_DB_PASSWORD=password

# Query DB (Read Models)
QUERY_DB_HOST=localhost
QUERY_DB_PORT=5432
QUERY_DB_NAME=auth_query_db
QUERY_DB_USER=postgres
QUERY_DB_PASSWORD=password
```

### TypeORM Configuration

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  name: 'default',
  type: 'postgres',
  database: 'auth_command_db',  // Event Store
  // ...
}),

TypeOrmModule.forRoot({
  name: 'queryConnection',
  type: 'postgres',
  database: 'auth_query_db',  // Read Models
  entities: [UserReadModel, SignInHistoryReadModel],
  synchronize: true,  // Auto-create tables
}),
```

---

## 🚀 Development

### Run Service

```bash
# Development with hot reload
bun run dev --service=auth

# Production
bun run build
bun run start:prod
```

### Project Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^11.x",
    "@nestjs/typeorm": "^10.x",
    "typeorm": "^0.3.x",
    "pg": "^8.x"
  }
}
```

### Module Registration

```typescript
// auth.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([UserReadModel, SignInHistoryReadModel], 'queryConnection'),
    MessageBrokerModule,
  ],
  providers: [
    // Command Handlers
    SignInCommandHandler,
    CreateUserCommandHandler,
    ChangePasswordCommandHandler,

    // Query Handlers
    GetUserQueryHandler,
    GetSignInHistoryQueryHandler,

    // Projections
    UserProjection,
    SignInHistoryProjection,

    // Event Store & Event Bus
    { provide: 'IEventStore', useClass: InMemoryEventStore },
    EventBusService,
  ],
})
export class AuthModule {}
```

---

## 🧪 Testing

### Unit Tests

```bash
# Test domain logic
bun test src/domain

# Test command handlers
bun test src/cqrs/command-handlers

# Test projections
bun test src/cqrs/projections
```

### Integration Tests

```bash
# Test complete flow
bun test src/usecases

# Test with database
bun test:e2e
```

### Test Examples

```typescript
describe('SignInCommandHandler', () => {
  it('should record sign-in event and update read model', async () => {
    // 1. Execute command
    const command = new SignInCommand('john', 'pass123');
    await handler.execute(command);

    // 2. Verify event in Event Store
    const events = await eventStore.getEventStream(userId);
    expect(events).toContainEqual(expect.objectContaining({ eventType: 'UserSignedInEvent' }));

    // 3. Verify Read Model updated
    const user = await userReadModelRepo.findOne({ where: { id: userId } });
    expect(user.totalSignIns).toBe(1);
    expect(user.failedSignInAttempts).toBe(0);
  });

  it('should lock account after 5 failed attempts', async () => {
    // Execute 5 failed sign-ins
    for (let i = 0; i < 5; i++) {
      try {
        await handler.execute(new SignInCommand('john', 'wrongpass'));
      } catch (e) {}
    }

    // Verify account locked
    const user = await userReadModelRepo.findOne({ where: { id: userId } });
    expect(user.isActive).toBe(false);

    // Verify UserDeactivatedEvent produced
    const events = await eventStore.getEventStream(userId);
    expect(events).toContainEqual(
      expect.objectContaining({
        eventType: 'UserDeactivatedEvent',
        reason: 'Too many failed sign-in attempts',
      }),
    );
  });
});
```

---

## 📊 Key Concepts

### 1. Eventual Consistency

Command DB và Query DB không sync ngay lập tức. Có delay nhỏ (~10-50ms).

```
t0: Command executed → Event saved to Event Store
t1: Projection triggered (10-50ms later)
t2: Read Model updated
t3: Query returns updated data
```

### 2. Idempotency

Projections kiểm tra xem event đã được xử lý chưa:

```typescript
const existing = await repo.findOne({
  where: { eventVersion: event.version },
});

if (existing) return; // Skip duplicate
```

### 3. Event Replay

Rebuild Read Models từ Event Store:

```typescript
// Delete all read models
await userReadModelRepo.clear();

// Replay all events
const events = await eventStore.getAllEvents();
for (const event of events) {
  await userProjection.handleEvent(event);
}
```

---

## 🔒 Production Considerations

### 1. Replace InMemoryEventStore with PostgreSQL

```typescript
@Injectable()
export class PostgresEventStore implements IEventStore {
  async append(aggregateId: string, events: DomainEvent[]): Promise<void> {
    await this.db.query(
      'INSERT INTO event_store (aggregate_id, event_type, event_data, version) VALUES ($1, $2, $3, $4)',
      [aggregateId, event.eventType, JSON.stringify(event), event.version],
    );
  }
}
```

### 2. Projection Error Handling

```typescript
try {
  await projection.handleEvent(event);
} catch (error) {
  // Retry with exponential backoff
  await retryQueue.add(event);

  // Dead letter queue after 3 retries
  if (retries > 3) {
    await deadLetterQueue.add(event);
    await alerting.notify('Projection failed', event);
  }
}
```

### 3. Caching

```typescript
@Injectable()
export class GetUserQueryHandler {
  async execute(query: GetUserQuery) {
    // Try cache first
    const cached = await this.cache.get(`user:${query.userId}`);
    if (cached) return cached;

    // Query database
    const user = await this.repo.findOne({ where: { id: query.userId } });

    // Cache for 5 minutes
    await this.cache.set(`user:${query.userId}`, user, 300);

    return user;
  }
}
```

---

## 📚 References

- [Main README](../../README.md) - Overview của toàn project
- [Shared Libraries](../../libs/README.md) - JWT, Message Broker, AWS, Base Classes
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [NestJS Documentation](https://docs.nestjs.com)

---

**Auth Service - Built with Clean Architecture, CQRS, and Event Sourcing** ✨
