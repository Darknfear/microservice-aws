# Architecture Deep Dive: Microservice + Clean Architecture# 📚 EVO MICROSERVICE API - ARCHITECTURE & DETAILED PROCESSING FLOW

> **Phân tích chi tiết mapping giữa Microservice Architecture và Clean Architecture trong dự án**> **System architecture analysis document for EVO Microservice API**

> Microservices system for online public services with CQRS + Event Sourcing

---> Version: 1.0

> Last Updated: 2024

## 📋 Table of Contents

---

1. [Pattern Mapping Overview](#pattern-mapping-overview)

2. [Detailed Layer Analysis](#detailed-layer-analysis)## 📖 TABLE OF CONTENTS

3. [Service Boundaries & Bounded Contexts](#service-boundaries--bounded-contexts)

4. [Code Quality Assessment](#code-quality-assessment)- [1. SYSTEM OVERVIEW](#1-system-overview)

5. [Refactoring Recommendations](#refactoring-recommendations)- [2. MICROSERVICES ARCHITECTURE](#2-microservices-architecture)

- [3. TECHNOLOGY STACK](#3-technology-stack)

---- [4. CQRS + EVENT SOURCING PATTERN](#4-cqrs--event-sourcing-pattern)

- [5. INTER-SERVICE COMMUNICATION](#5-inter-service-communication)

## 1. Pattern Mapping Overview- [6. DOSSIER CREATION FLOW (WRITE FLOW)](#6-dossier-creation-flow-write-flow)

- [7. LIST RETRIEVAL FLOW (READ FLOW)](#7-list-retrieval-flow-read-flow)

### 1.1 Clean Architecture → Microservice Components- [8. DATABASE DESIGN](#8-database-design)

- [9. API DESIGN PATTERNS](#9-api-design-patterns)

````- [10. BEST PRACTICES](#10-best-practices)

┌─────────────────────────────────────────────────────────────────┐

│                     CLEAN ARCHITECTURE                          │---

├─────────────────────────────────────────────────────────────────┤

│  Layer 1: Interfaces (Controllers, DTOs)                        │## 1. SYSTEM OVERVIEW

│     ↓                                                           │

│  Layer 2: Usecases (Business Workflows)                        │### 1.1. Introduction

│     ↓                                                           │

│  Layer 3: Ports (Interfaces for external dependencies)         │**EVO Microservice API** is a backend microservices system serving **Mobifone's online public services**, built with modern technologies:

│     ↓                                                           │

│  Layer 4: Domain (Entities, Events, Value Objects, Errors)     │- **Framework**: NestJS 11.x (Node.js)

│     ↓                                                           │- **Language**: TypeScript 5.8

│  Layer 5: Infrastructure (DB, External APIs, Message Broker)   │- **Architecture**: CQRS + Event Sourcing

└─────────────────────────────────────────────────────────────────┘- **Database**: MySQL 8.0 (Command & Query)

                              ↓- **Message Broker**: NATS

                    MAPS TO MICROSERVICE- **Cache**: Redis

                              ↓- **Storage**: MinIO (S3-compatible)

┌─────────────────────────────────────────────────────────────────┐

│                    MICROSERVICE ARCHITECTURE                     │### 1.2. System Overview Diagram

├─────────────────────────────────────────────────────────────────┤

│  ┌────────────────────────────────────────────────────────────┐ │```mermaid

│  │  API Gateway (Future)                                      │ │graph TB

│  │  - Public routes: /api/auth/*, /api/users/*              │ │    subgraph "Client Layer"

│  │  - Load balancing                                         │ │        WEB[Web Browser]

│  │  - Rate limiting                                          │ │        MOBILE[Mobile App]

│  └────────────────────────────────────────────────────────────┘ │        ADMIN[Admin Portal]

│                              ↓                                   │    end

│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │

│  │  Auth Service   │    │  User Service   │    │ Order Service│ │    subgraph "API Gateway"

│  │                 │    │   (Planned)     │    │  (Planned)   │ │        GATEWAY[Gateway Service]

│  │  - Clean Arch   │    │  - Clean Arch   │    │ - Clean Arch │ │    end

│  │  - CQRS+ES      │    │  - CQRS?        │    │ - CQRS?      │ │

│  │  - Database per │    │  - Database per │    │ - Database   │ │    subgraph "Microservices"

│  │    Service      │    │    Service      │    │   per Service│ │        AUTH[Auth Service]

│  └────────┬────────┘    └────────┬────────┘    └──────┬───────┘ │        CONFIG[Configuring Service]

│           │                      │                     │         │        ORG[Organizing Service]

│  ┌────────▼──────────────────────▼─────────────────────▼──────┐ │        SUBMIT[Submitting Service]

│  │              Message Broker (RabbitMQ/Kafka)              │ │        PROCESS[Processing Service]

│  │  - Event publishing (EventBus → MessageBroker)            │ │        RESPOND[Responding Service]

│  │  - Event subscriptions (Projections, Inter-service comm) │ │        PROFILE[Profiling Service]

│  └───────────────────────────────────────────────────────────┘ │        COORD[Coordinating Service]

│                              ↓                                   │    end

│  ┌────────────────────────────────────────────────────────────┐ │

│  │  Databases (PostgreSQL - Database per Service Pattern)    │ │    subgraph "Infrastructure"

│  │  - auth_command_db (Event Store - append only)            │ │        NATS[NATS Broker]

│  │  - auth_query_db (Read Models - fast queries)             │ │        MYSQL[(MySQL)]

│  │  - user_db (future)                                        │ │        REDIS[(Redis)]

│  │  - order_db (future)                                       │ │        MINIO[MinIO Storage]

│  └────────────────────────────────────────────────────────────┘ │    end

└─────────────────────────────────────────────────────────────────┘

```    WEB --> GATEWAY

    MOBILE --> GATEWAY

### 1.2 Pattern Compatibility Matrix    ADMIN --> GATEWAY



| Clean Architecture Layer | Microservice Component | Status | Notes |    GATEWAY --> AUTH

|--------------------------|------------------------|--------|-------|    GATEWAY --> CONFIG

| **Interfaces** (Controllers, DTOs) | Service API Endpoints | ✅ Compatible | Internal routes for inter-service, public routes via API Gateway |    GATEWAY --> ORG

| **Usecases** (Business Logic) | Service Business Logic | ✅ Compatible | Each service has own usecases, no shared business logic |    GATEWAY --> SUBMIT

| **Ports** (Interfaces) | Service Contracts | ✅ Compatible | Each service defines its own ports (IRepository, IService) |    GATEWAY --> PROCESS

| **Domain** (Entities, Events, VOs) | Service Domain Model | ⚠️ Requires Bounded Contexts | Each service must have own domain entities (no sharing) |    GATEWAY --> RESPOND

| **Infrastructure** (DB, APIs) | External Dependencies | ✅ Compatible | Database per service, Message Broker for inter-service |    GATEWAY --> PROFILE

    GATEWAY --> COORD

---

    AUTH -.-> NATS

## 2. Detailed Layer Analysis    CONFIG -.-> NATS

    ORG -.-> NATS

### 2.1 Layer 1: Interfaces (Presentation Layer)    SUBMIT -.-> NATS

    PROCESS -.-> NATS

**Clean Architecture**: Controllers, DTOs, Filters    RESPOND -.-> NATS

    PROFILE -.-> NATS

**Microservice Implementation**:    COORD -.-> NATS

````

src/apps/auth/src/interfaces/ AUTH --> MYSQL

├── http/ CONFIG --> MYSQL

│ ├── controllers/ ORG --> MYSQL

│ │ └── auth.controller.ts # REST API endpoints SUBMIT --> MYSQL

│ ├── dtos/ PROCESS --> MYSQL

│ │ └── sign-in.dto.ts # Request/Response DTOs RESPOND --> MYSQL

│ └── filters/ PROFILE --> MYSQL

│ └── domain-exception.filter.ts # Error handling

└── admin/ AUTH --> REDIS

    └── auth.controller.ts          # Admin endpoints (internal)    CONFIG --> REDIS

```````ORG --> REDIS

    SUBMIT --> REDIS

**✅ Strengths**:

- Clear separation: Public routes (`/auth/*`) vs Admin routes (`/admin/*`)    SUBMIT --> MINIO

- DTOs validate incoming requests (class-validator)    RESPOND --> MINIO

- Domain exceptions caught by filters and converted to HTTP responses```

- Ready for API Gateway (internal routes can be prefixed with `/internal`)

---

**🔧 Refactoring Recommendations**:

```typescript## 2. MICROSERVICES ARCHITECTURE

// FUTURE: Separate internal and public controllers

### 2.1. Services List

// ✅ GOOD: Public Controller (via API Gateway)

@Controller('api/auth')  // Public route| Service | Port | Function | Database |

export class AuthController {|---------|------|----------|----------|

  @Post('sign-in')| **auth** | 16201 | Authentication & authorization | MySQL + Redis + CQL |

  async signIn(@Body() dto: SignInDto) {| **configuring** | 16203 | Procedure & category configuration | MySQL (Command + Query) |

    // Public endpoint| **organizing** | 16202 | Organization, department, employee management | MySQL + CQL |

  }| **submitting** | 16206 | Dossier submission from citizens | MySQL + CQL + Redis |

}| **processing** | 16207 | Dossier workflow processing | MySQL |

| **responding** | 16204 | Result response to citizens | MySQL |

// ✅ GOOD: Internal Controller (inter-service communication)| **profiling** | 16205 | Citizen profile management | MySQL |

@Controller('internal/auth')  // Internal route| **coordinating** | 16210 | External system coordination | MySQL + CQL |

export class AuthInternalController {| **wrapper** | 16208 | Integration wrapper API | - |

  @Get('users/:id')| **gateway** | 16209 | API Gateway (reverse proxy) | - |

  async getUserById(@Param('id') id: string) {| **internal** | - | Workers, background jobs | - |

    // Internal endpoint for other services

  }### 2.2. Service Dependencies

}

``````mermaid

graph LR

---    AUTH[Auth Service]

    CONFIG[Configuring]

### 2.2 Layer 2: Usecases (Application Layer)    ORG[Organizing]

    SUBMIT[Submitting]

**Clean Architecture**: Business workflows, orchestration    PROCESS[Processing]

    RESPOND[Responding]

**Microservice Implementation**:    PROFILE[Profiling]

```````

src/apps/auth/src/usecases/ AUTH -->|get employee| ORG

├── event-bus/ SUBMIT -->|get formality| CONFIG

│ └── event-bus.service.ts # Publishes events to Event Store + Projections + Message Broker SUBMIT -->|get department| ORG

└── sign-in/ SUBMIT -->|create citizen| PROFILE

    ├── sign-in.usecase.ts         # Original usecase (repository-based)    PROCESS -->|forward dossier| SUBMIT

    └── event-sourcing-sign-in.usecase.ts  # Event sourcing usecase    RESPOND -->|update dossier| SUBMIT

```PROFILE -->|get citizen| COORD

```

**✅ Strengths**:

- No direct HTTP calls to other services (follows Clean Architecture)---

- Uses `EventBusService` to publish events to Message Broker

- Each service has own usecases (no shared business logic)## 3. TECHNOLOGY STACK

**❌ Issue Found**:### 3.1. Core Technologies

The `EventBusService` is in `usecases/` but it's more of an infrastructure service. It should be in `infra/`.

````typescript

**🔧 Refactoring Recommendation**:{

```bash  "framework": "NestJS 11.1.3",

# Move EventBusService to infrastructure layer  "runtime": "Node.js 22+",

src/apps/auth/src/usecases/event-bus/  →  src/apps/auth/src/infra/event-bus/  "language": "TypeScript 5.8",

```  "httpServer": "Fastify 5.4",

  "packageManager": "pnpm 10.11"

**Reasoning**:}

- `EventBusService` depends on `MessageBrokerService` (external dependency)```

- It handles infrastructure concerns (Event Store, Message Broker)

- Usecases should call `EventBusService` via a port interface (`IEventBus`)### 3.2. Database & Storage



**Updated Structure**:```typescript

```typescript{

// Port (interfaces layer)  "primaryDb": "MySQL 8.0",

export interface IEventBus {  "orm": "TypeORM 0.3.25",

  publishAggregateEvents(aggregate: UserAggregate): Promise<void>;  "cache": "Redis",

}  "eventStore": "ScyllaDB/Cassandra (CQL)",

  "objectStorage": "MinIO"

// Infrastructure implementation}

@Injectable()```

export class EventBusService implements IEventBus {

  constructor(### 3.3. Message Broker

    @Inject('IEventStore') private eventStore: IEventStore,

    private messageBroker: MessageBrokerService,```typescript

  ) {}{

    "messageBroker": "NATS 2.29",

  async publishAggregateEvents(aggregate: UserAggregate): Promise<void> {  "pattern": "Request/Reply + Pub/Sub",

    // ... implementation  "serialization": "msgpackr (binary)"

  }}

}```



// Usecase depends on port### 3.4. Monitoring & Observability

export class SignInUsecase {

  constructor(```typescript

    @Inject('IEventBus') private eventBus: IEventBus,{

  ) {}  "tracing": "OpenTelemetry",

}  "backend": "Tempo / Jaeger",

```  "logging": "Winston",

  "alerting": "Telegram Bot"

---}

````

### 2.3 Layer 3: Ports (Interfaces for dependencies)

---

**Clean Architecture**: Interfaces that define contracts

## 4. CQRS + EVENT SOURCING PATTERN

**Microservice Implementation**:

````### 4.1. CQRS Overview

src/apps/auth/src/ports/

├── event-store/**CQRS** (Command Query Responsibility Segregation) tách biệt hoàn toàn Write và Read models.

│   └── event-store.interface.ts   # IEventStore

├── repositories/```mermaid

│   └── user.repository.interface.ts  # IUserRepositorygraph TB

└── services/    subgraph "Command Side (Write)"

    └── password.service.interface.ts  # IPasswordService        CMD[Command]

```        AGG[Aggregate]

        EVENT[Event]

**✅ Strengths**:        ES[(Event Store)]

- Clear separation of concerns

- Dependency inversion: Usecases depend on interfaces, not implementations        CMD --> AGG

- Easy to mock in tests        AGG --> EVENT

        EVENT --> ES

**🔧 Refactoring Recommendation**:    end

Add `IEventBus` interface:

```typescript    subgraph "Query Side (Read)"

// src/apps/auth/src/ports/event-bus/event-bus.interface.ts        PROJ[Projection Handler]

        QM[(Query Model)]

import { UserAggregate } from '@apps/auth/src/domain/entities/user-aggregate';        QUERY[Query]



export interface IEventBus {        PROJ --> QM

  /**        QUERY --> QM

   * Publish aggregate events to:    end

   * 1. Event Store (Command DB)

   * 2. Projections (Query DB)    ES -.emit.-> PROJ

   * 3. Message Broker (other services)

   */    style CMD fill:#ff9999

  publishAggregateEvents(aggregate: UserAggregate): Promise<void>;    style QUERY fill:#99ccff

}```

````

### 4.2. Command Side (Write)

---

**Event Store Schema:**

### 2.4 Layer 4: Domain (Core Business Logic)

````sql

**Clean Architecture**: Entities, Value Objects, Domain Events, ErrorsCREATE TABLE submitting_dossier_events (

    id VARCHAR(36) PRIMARY KEY,              -- UUID v7

**Microservice Implementation**:    version INT NOT NULL,                    -- Event version

```    created_at BIGINT NOT NULL,              -- Timestamp

src/apps/auth/src/domain/    event_name VARCHAR(255),                 -- "DossierCreated"

├── entities/    event_payload JSON,                      -- Event data

│   ├── user-aggregate.ts          # Event Sourcing: UserAggregate    data JSON,                               -- Current state snapshot

│   └── user.entity.ts             # Traditional: User entity    INDEX idx_created_at (created_at)

├── events/);

│   └── user.events.ts             # 6 domain events (UserRegistered, UserSignedIn, etc.)```

├── value-objects/

│   ├── username.ts                # Username value object**Example Event Record:**

│   └── email.ts                   # Email value object

└── errors/```json

    └── index.ts                   # Domain errors (UserNotFound, InvalidCredentials, etc.){

```  "id": "01927f1c-3e8d-7890-abcd-0242ac120002",

  "version": 1,

**✅ Strengths**:  "created_at": 1730000000000,

- Rich domain model with business rules  "event_name": "DossierCreated",

- Event Sourcing: `UserAggregate` with event stream  "event_payload": {

- Value Objects enforce validation    "dossierId": "01927f1c-3e8d-7890-abcd-0242ac120002",

- Domain events capture state changes    "code": "EVO-001-2024-00001",

    "state": "PENDING_SUBMISSION",

**⚠️ Bounded Context Check**:    "applicantName": "John Doe",

- ✅ Auth Service domain is isolated    "formalityId": "formality-uuid-001"

- ✅ No shared domain entities with other services (yet - User/Order services not implemented)  },

  "data": {

**Future Considerations**:    "id": "01927f1c-3e8d-7890-abcd-0242ac120002",

When implementing User Service and Order Service:    "code": "EVO-001-2024-00001",

    "state": "PENDING_SUBMISSION",

```typescript    "applicantInfo": { "citizen": {...} },

// ❌ BAD: Sharing domain entities across services    "formality": { "id": "...", "name": "..." },

// Auth Service    "timeline": { "createdAt": 1730000000000 }

export class UserAggregate { ... }  }

}

// User Service (imports from Auth Service)```

import { UserAggregate } from '@apps/auth/src/domain/entities/user-aggregate';  // ❌ WRONG

### 4.3. Query Side (Read)

// ✅ GOOD: Each service has own domain entities (Bounded Context)

// Auth Service**Denormalized Table Schema:**

export class UserAggregate {

  id: string;```sql

  username: string;CREATE TABLE submitting_dossier (

  passwordHash: string;  // Auth-specific    id VARCHAR(36) PRIMARY KEY,

  failedSignInAttempts: number;  // Auth-specific    code VARCHAR(128) UNIQUE,

}

    -- Denormalized fields for fast query

// User Service    department_id VARCHAR(36),

export class UserProfile {    department_name VARCHAR(256),

  id: string;    applicant_name VARCHAR(256),

  username: string;  // Denormalized from Auth Service    formality_id VARCHAR(36),

  bio: string;  // Profile-specific    formality_name VARCHAR(256),

  avatar: string;  // Profile-specific    dossier_source VARCHAR(16),

}    dossier_type VARCHAR(16),

    state VARCHAR(64),

// Order Service

export class Customer {    -- Timestamps for range queries

  id: string;    created_at BIGINT,

  username: string;  // Denormalized from Auth Service    submitted_at BIGINT,

  shippingAddress: string;  // Order-specific    received_at BIGINT,

}

```    -- Cache JSON for complex data

    cache JSON,

---

    -- Indexes

### 2.5 Layer 5: Infrastructure (External Dependencies)    INDEX idx_code (code),

    INDEX idx_department_id (department_id),

**Clean Architecture**: Database, External APIs, Message Queue    INDEX idx_formality_id (formality_id),

    INDEX idx_state (state),

**Microservice Implementation**:    INDEX idx_created_at (created_at)

```);

src/apps/auth/src/infra/```

├── event-store/

│   └── in-memory-event-store.ts   # Event Store implementation (in-memory for dev)### 4.4. Event Sourcing Flow

├── repositories/

│   └── user.repository.ts         # TypeORM repository (Query DB)```mermaid

└── services/sequenceDiagram

    └── password.service.ts        # bcrypt password hashing    participant Client

```    participant Service

    participant Aggregate

**✅ Strengths**:    participant EventStore

- Implementations are decoupled from domain    participant EventEmitter

- Event Store is abstracted (easy to swap in-memory → PostgreSQL)    participant Projection

- Repository pattern for Query DB (read models)    participant QueryDB



**🔧 Refactoring Recommendations**:    Client->>Service: Command

    Service->>Aggregate: Create aggregate

1. **Move EventBusService to infrastructure**:    Aggregate->>Service: Return aggregate

```bash    Service->>EventStore: Commit event

src/apps/auth/src/usecases/event-bus/  →  src/apps/auth/src/infra/event-bus/

```    Note over EventStore: INSERT event<br/>Cache Redis<br/>Version++



2. **Add PostgreSQL Event Store implementation**:    EventStore->>EventEmitter: Emit event

```typescript    EventEmitter->>Projection: Handle event

// src/apps/auth/src/infra/event-store/postgres-event-store.ts    Projection->>QueryDB: Update query model



@Injectable()    Service->>Client: Response (ID)

export class PostgresEventStore implements IEventStore {

  constructor(    Note over QueryDB: Denormalized data<br/>ready for fast reads

    @InjectRepository(EventStoreEntity)```

    private eventRepo: Repository<EventStoreEntity>,

  ) {}---



  async append(aggregateId: string, events: DomainEvent[]): Promise<void> {## 5. INTER-SERVICE COMMUNICATION

    const entities = events.map(event => ({

      aggregateId,### 5.1. NATS Request/Reply Pattern

      eventType: event.eventType,

      data: event.toObject(),```mermaid

      version: event.version,sequenceDiagram

      timestamp: event.timestamp,    participant ServiceA as Auth Service

    }));    participant NATS as NATS Broker

    await this.eventRepo.save(entities);    participant ServiceB as Organizing Service

  }

    ServiceA->>NATS: request("organizing.get-employee", {username})

  async getEventStream(aggregateId: string): Promise<DomainEvent[]> {    Note over NATS: Route to handler

    const entities = await this.eventRepo.find({    NATS->>ServiceB: Deliver message

      where: { aggregateId },    ServiceB->>ServiceB: Handle request

      order: { version: 'ASC' },    ServiceB->>NATS: reply({ok: true, response: {...}})

    });    NATS->>ServiceA: Deliver response

    return entities.map(e => this.deserializeEvent(e));

  }    Note over ServiceA: Check ok flag<br/>Process response

}```

````

### 5.2. Implementation Pattern

3. **Add Message Broker error handling**:

````typescript**Defining Service Contract** (libs/messaging):

// src/apps/auth/src/infra/event-bus/event-bus.service.ts

```typescript

async publishAggregateEvents(aggregate: UserAggregate): Promise<void> {// libs/messaging/src/organizing/get-employee-by-ids/index.ts

  // ... existing code ...export abstract class IGetEmployeeByIdsService extends SyncMessage<

    IGetEmployeeByIdsRequest,

  // 3. Publish to message broker with retry    IGetEmployeeByIdsResponse

  for (const event of events) {> {

    try {    static override key = 'organizing.get-employees-by-ids'

      await this.messageBroker.publish({

        eventType: event.eventType,    static request: ISendSyncRequest<

        aggregateId: event.aggregateId,        IGetEmployeeByIdsRequest,

        timestamp: event.timestamp,        IGetEmployeeByIdsResponse

        data: event.toObject(),    > = sendSyncRequest.bind(null, IGetEmployeeByIdsService.key)

        version: event.version,}

      });```

    } catch (error) {

      console.error(`[EventBus] Failed to publish event to message broker:`, error);**Implementing Reply Handler**:

      // TODO: Implement retry logic or dead letter queue

      // For now, we continue (eventual consistency)```typescript

    }// apps/organizing/src/features/employee/querying/get-employee-by-ids.service.ts

  }@Injectable()

}export class GetEmployeeByIdsService implements OnModuleInit {

```    static SERVICE_KEY = 'organizing.get-employees-by-ids'



---    constructor(

        private readonly communicatorService: CommunicatorService,

## 3. Service Boundaries & Bounded Contexts        private readonly queryRepo: OrganizingQueryRepo

    ) {}

### 3.1 Auth Service Bounded Context

    async onModuleInit() {

**Domain Concepts**:        // Register handler when service starts

- User authentication (sign-in, password management)        await this.communicatorService.reply(

- User registration            GetEmployeeByIdsService.SERVICE_KEY,

- Failed sign-in attempts tracking            async (request: IGetEmployeeByIdsRequest) => {

- Auto lockout after 5 failed attempts                return await this.handle(request)

            }

**Domain Entities**:        )

- `UserAggregate` (event sourced)    }

- `User` (traditional entity for Query DB)

    private async handle(request: IGetEmployeeByIdsRequest) {

**Domain Events**:        const employees = await this.queryRepo.employeeRepo.find({

1. `UserRegisteredEvent`            where: { id: In(request.employeeIds) }

2. `UserSignedInEvent`        })

3. `PasswordChangedEvent`

4. `UserLockedOutEvent`        return { employees }

5. `FailedSignInAttemptRecordedEvent`    }

6. `UserUnlockedEvent`}

````

**Read Models**:

- `UserReadModel` (Query DB)**Calling from Another Service**:

- `SignInHistoryReadModel` (Query DB)

`````typescript

**Boundaries**:// apps/auth/src/features/admin-authenticating/sign-in-by-admin.service.ts

- ✅ No dependencies on other servicesconst { ok, response } = await IGetEmployeeByIdsService.request(

- ✅ No shared domain entities    this.communicatorService,

- ✅ Events published to Message Broker for inter-service communication    { employeeIds: ['emp-001', 'emp-002'] },

    { timeout: 3000, traceId: ctx.traceId }

---)



### 3.2 Future: User Service Bounded Contextif (!ok || !response) {

    return throwServerError()

**Domain Concepts** (planned):}

- User profile management

- Avatar upload// Use response.employees

- Bio/description```

- User preferences

### 5.3. Response Format (Standardized)

**Domain Entities**:

- `UserProfile` (NOT `UserAggregate` from Auth Service)```typescript

interface SyncResponse<T> {

**Domain Events**:    ok: boolean           // Success flag

- `UserProfileUpdatedEvent`    response: T | null    // Data payload

- `AvatarUploadedEvent`    code: string          // Error/Status code

    message: string       // Human-readable message

**Read Models**:}

- `UserProfileReadModel````



**Boundaries**:---

- ❌ Should NOT import `UserAggregate` from Auth Service

- ✅ Should subscribe to `UserRegisteredEvent` from Auth Service to create initial profile## 6. DOSSIER CREATION FLOW (WRITE FLOW)

- ✅ Should have own database (`user_db`)

### 6.1. Sequence Diagram - Complete Flow

**Event-Driven Communication**:

```typescript```mermaid

// User Service listens to Auth Service eventssequenceDiagram

    actor Citizen

@Injectable()    participant Controller

export class UserProfileProjection {    participant Service

  @EventHandler('UserRegisteredEvent')    participant PrepareData

  async onUserRegistered(event: UserRegisteredEvent) {    participant Redis

    // Create initial user profile    participant NATS

    await this.userProfileRepo.save({    participant InternalService

      userId: event.userId,    participant EventStore

      username: event.username,  // Denormalized    participant EventEmitter

      bio: '',    participant Projection

      avatar: null,    participant QueryDB

    });

  }    Citizen->>Controller: POST /submitting/create-dossier-by-citizen

}    Note over Controller: @GuardCitizen()<br/>Extract JWT

```    Controller->>Service: handle(request, citizen)



---    Service->>Service: validateDossierType()

    Service->>PrepareData: handle(request, citizen)

### 3.3 Future: Order Service Bounded Context

    par Parallel Validation

**Domain Concepts** (planned):        PrepareData->>NATS: Get Department

- Order creation        PrepareData->>NATS: Get Formality

- Order status tracking        PrepareData->>NATS: Get Category

- Customer information    end



**Domain Entities**:    PrepareData-->>Service: Validated data

- `Order` (order aggregate)

- `Customer` (NOT `UserAggregate` from Auth Service)    Service->>Redis: Generate dossier code

    Redis-->>Service: EVO-001-2024-00001

**Domain Events**:

- `OrderCreatedEvent`    Service->>NATS: CreateDossierService.request()

- `OrderShippedEvent`    NATS->>InternalService: Handle create

- `OrderDeliveredEvent`

    InternalService->>InternalService: Create aggregate

**Read Models**:    InternalService->>InternalService: Create DossierCreated event

- `OrderReadModel` (includes denormalized `username` from Auth Service)    InternalService->>EventStore: Commit event



**Boundaries**:    Note over EventStore: INSERT to MySQL<br/>Cache to Redis<br/>Version = 1

- ❌ Should NOT import `UserAggregate` from Auth Service

- ✅ Should subscribe to `UserRegisteredEvent` to cache username    EventStore->>EventEmitter: Emit DossierCreated

- ✅ Should have own database (`order_db`)    EventEmitter->>Projection: @OnEvent handler



**Event-Driven Communication**:    Projection->>QueryDB: Insert denormalized row

```typescript

// Order Service listens to Auth Service events    InternalService-->>NATS: Response {dossierId}

    NATS-->>Service: {ok: true, response}

@Injectable()    Service-->>Controller: {dossierId}

export class OrderProjection {    Controller-->>Citizen: 200 OK {dossierId}

  @EventHandler('UserRegisteredEvent')

  async onUserRegistered(event: UserRegisteredEvent) {    Note over Projection,QueryDB: Async - doesn't block response

    // Cache username for orders```

    await this.customerRepo.save({

      userId: event.userId,### 6.2. Step-by-Step Implementation

      username: event.username,  // Denormalized

      shippingAddress: null,#### **Step 1: HTTP Request**

    });

  }```http

POST /api/v1/submitting/create-dossier-by-citizen HTTP/1.1

  @EventHandler('UserUpdatedEvent')Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

  async onUserUpdated(event: UserUpdatedEvent) {Content-Type: application/json

    // Update denormalized username in all orders

    await this.orderReadModelRepo.update({

      { userId: event.userId },  "applicant": {

      { username: event.newUsername },    "citizen": {

    );      "identity": "001234567890",

  }      "name": "John Doe",

}      "phone": "0987654321",

```      "email": "johndoe@gmail.com"

    }

---  },

  "type": "CITIZEN",

## 4. Code Quality Assessment  "formalityId": "formality-uuid-001",

  "formalityCaseId": "case-uuid-001",

### 4.1 ✅ Strengths  "departmentId": "dept-uuid-001",

  "categoryId": "cat-uuid-001",

1. **Clean Architecture Compliance**:  "formJson": "{\"companyName\":\"ABC Corp\"}",

   - ✅ Clear layer separation (Interfaces → Usecases → Ports → Domain → Infrastructure)  "profileComponents": [...],

   - ✅ Dependency inversion (usecases depend on interfaces, not implementations)  "fees": [...],

   - ✅ No business logic in controllers  "returning": "AT_DEPARTMENT",

   - ✅ Domain entities are rich (not anemic)  "isDraft": false

}

2. **CQRS + Event Sourcing**:```

   - ✅ Command side (write model) and Query side (read model) separated

   - ✅ Event Store for command DB (append-only, immutable)#### **Step 2: Controller Layer**

   - ✅ Read models for query DB (fast queries, denormalized)

   - ✅ Projections for eventual consistency```typescript

@Controller()

3. **Microservice Architecture**:@GuardCitizen()  // ✅ Verify JWT + extract citizen

   - ✅ Database per service pattern (auth_command_db, auth_query_db)export class CitizenCreatingController {

   - ✅ Event-driven communication via Message Broker    @Post('/submitting/create-dossier-by-citizen')

   - ✅ No direct HTTP calls between services    async createDossierByCitizen(

   - ✅ Bounded context respected (no shared domain entities)        @Body() body: CreateDossierByCitizenRequest,  // ✅ DTO validation

        @Citizen() citizen: CitizenInfoDto             // ✅ From JWT

4. **Code Organization**:    ) {

   - ✅ Consistent folder structure        return this.createDossierByCitizenService.handle(body, citizen)

   - ✅ TypeScript with strict types    }

   - ✅ NestJS dependency injection}

   - ✅ Domain events are well-documented```



5. **Testing**:#### **Step 3: Service Handle**

   - ✅ Unit tests for domain entities

   - ✅ Integration tests for repositories```typescript

   - ✅ E2E tests for API endpointsasync handle(request, citizen) {

    // ✅ 1. Validate dossier type

---    validateDossierType({ user: citizen, dossierType: request.type })



### 4.2 ⚠️ Areas for Improvement    // ✅ 2. Prepare & validate data (parallel calls)

    const data = await this.prepareCreateDossierByCitizenData.handle(request, citizen)

1. **EventBusService Location**:

   - ❌ Currently in `usecases/event-bus/`    const now = +DayJs()

   - ✅ Should be in `infra/event-bus/`

   - **Reason**: It depends on external dependencies (EventStore, MessageBroker)    // ✅ 3. Generate unique dossier code

    const generatedCode = await generateDossierCode({

2. **Missing IEventBus Port**:        departmentId: data.department.id,

   - ❌ No interface for EventBusService        departmentCode: data.department.code,

   - ✅ Should create `IEventBus` in `ports/event-bus/`        dossierCodeRepo: this.dossierCodeRepo,

   - **Reason**: Dependency inversion principle    })

    // generatedCode = "EVO-001-2024-00001"

3. **In-Memory Event Store**:

   - ⚠️ Currently using in-memory event store (good for dev, not production)    // ✅ 4. Generate UUID for dossier

   - ✅ Should implement PostgreSQL event store    const dossierId = v7()  // Time-ordered UUID

   - **Reason**: Production needs persistence

    // ✅ 5. Create dossier history (audit trail)

4. **No API Gateway Yet**:    await createDossierHistoryInternal({ ... }, this.queryRepo)

   - ⚠️ Services expose public routes directly

   - ✅ Should add API Gateway (NestJS Gateway or Kong)    // ✅ 6. Convert applicant & beneficiary

   - **Reason**: Centralized routing, rate limiting, authentication    const applicant = convertApplicant({ type: request.type, applicant: request.applicant })

    const beneficiary = convertBeneficiary({ type: request.type, beneficiary: request.beneficiary })

5. **Error Handling in Projections**:

   - ⚠️ Basic try-catch with console.error    // ✅ 7. Call internal service via NATS

   - ✅ Should implement retry logic, dead letter queue, alerting    const { ok, response } = await CreateDossierService.request(

   - **Reason**: Production resilience        this.communicatorService,

        {

6. **No Saga Pattern**:            dossierId,

   - ⚠️ No distributed transactions yet (not needed until User/Order services)            state: request.isDraft ? DRAFT : PENDING_SUBMISSION,

   - ✅ Should implement Saga pattern when multiple services are involved            code: generatedCode,

   - **Example**: When creating an order, need to reserve inventory, process payment, etc.            applicantIdentity: applicant.id,

            applicantName: applicant.name,

---            // ... many other fields

        },

## 5. Refactoring Recommendations        { timeout: 5000 }

    )

### 5.1 Priority 1: High Priority (Before Production)

    // ✅ 8. Handle response

#### 1. Move EventBusService to Infrastructure    if (!ok || !response) return throwServerError()



**Current**:    return { dossierId }

```}

src/apps/auth/src/usecases/event-bus/event-bus.service.ts```

`````

#### **Step 4: PrepareData - Parallel Validation**

**New**:

````typescript

src/apps/auth/src/infra/event-bus/event-bus.service.tsasync handle(request, citizen) {

```    // ✅ Parallel calls to other services

    const [departmentResponse, formalityResponse, categoryResponse] =

**Steps**:        await Promise.all([

```bash            GetDepartmentByIdsService.request(this.communicatorService,

# 1. Create port interface                { departmentIds: [request.departmentId] },

mkdir -p src/apps/auth/src/ports/event-bus                { timeout: 3000 }

touch src/apps/auth/src/ports/event-bus/event-bus.interface.ts            ),

            GetFormalityService.request(this.communicatorService,

# 2. Move service to infrastructure                { formalityId: request.formalityId, caseId: request.formalityCaseId },

mv src/apps/auth/src/usecases/event-bus src/apps/auth/src/infra/event-bus                { timeout: 3000 }

            ),

# 3. Update all imports            GetCategoryByIdsService.request(this.communicatorService,

# Find and replace:                { categoryIds: [request.categoryId] },

# @apps/auth/src/usecases/event-bus → @apps/auth/src/infra/event-bus                { timeout: 3000 }

```            )

        ])

**Code Changes**:

```typescript    // ✅ Check all responses

// src/apps/auth/src/ports/event-bus/event-bus.interface.ts    if (!departmentResponse.ok) return throwObjectNotFound('Department not found')

export interface IEventBus {    if (!formalityResponse.ok) return throwObjectNotFound('Formality not found')

  publishAggregateEvents(aggregate: UserAggregate): Promise<void>;    if (!categoryResponse.ok) return throwObjectNotFound('Category not found')

}

    return {

// src/apps/auth/src/infra/event-bus/event-bus.service.ts        department: departmentResponse.response.departments[0],

@Injectable()        formality: formalityResponse.response.formality,

export class EventBusService implements IEventBus {        category: categoryResponse.response.categories[0],

  // ... existing implementation        // ... other validated data

}    }

}

// Command handlers use port```

export class SignInCommandHandler {

  constructor(#### **Step 5: Internal Service - Event Sourcing**

    @Inject('IEventBus') private eventBus: IEventBus,  // ← Port instead of concrete class

  ) {}```typescript

}@Injectable()

export class CreateDossierService implements OnModuleInit {

// Module registration    static SERVICE_NAME = 'submitting.create-dossier'

providers: [

  {    async onModuleInit() {

    provide: 'IEventBus',        await this.communicatorService.reply(

    useClass: EventBusService,            CreateDossierService.SERVICE_NAME,

  },            async (request) => await this.handle(request)

],        )

```    }



---    private async handle(request: CreateDossierRequest) {

        // ✅ 1. Create aggregate

#### 2. Implement PostgreSQL Event Store        const aggregate = this.commandRepo.dossierEventRepo.create(

            request.dossierId,

**Current**: In-memory event store (dev only)            {

                id: request.dossierId,

**New**: PostgreSQL event store (production)                code: request.code,

                state: request.state,

**Steps**:                applicantInfo: request.applicant,

                formality: { ... },

1. **Create Event Store Entity**:                timeline: { createdAt: request.createdAt, ... },

```typescript                // ... full state

// src/apps/auth/src/infra/event-store/entities/event-store.entity.ts            }

        )

import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

        // ✅ 2. Create event

@Entity('event_store')        const event = new DossierCreated({ ...request })

@Index(['aggregateId', 'version'])

export class EventStoreEntity {        // ✅ 3. Commit (Save + Cache + Emit)

  @PrimaryGeneratedColumn('uuid')        await this.commandRepo.dossierEventRepo.commit(

  id: string;            aggregate,

            event,

  @Column()            { createdAt: request.createdAt }

  @Index()        )

  aggregateId: string;

        return { dossierId: request.dossierId }

  @Column()    }

  eventType: string;

    // ✅ 4. Projection handler

  @Column('jsonb')    @OnEvent(DossierCreated.name)

  data: any;    async projectDossierCreated({ event, id, data, createdAt }) {

        await this.alertService.projectionWrapper(

  @Column()            'submitting',

  version: number;            DossierCreated.name,

            { event, id, data, createdAt },

  @Column()            async (eventData) => {

  timestamp: Date;                // Transform to query model (denormalized)

}                const queryModel = this.queryRepo.submittingDossierRepo.create({

```                    id: eventData.id,

                    code: eventData.data.code,

2. **Implement PostgreSQL Event Store**:                    departmentId: eventData.data.organization.departmentId,

```typescript                    departmentName: eventData.data.department.name,

// src/apps/auth/src/infra/event-store/postgres-event-store.ts                    applicantName: eventData.data.applicantInfo.citizen?.name,

                    formalityId: eventData.data.formality.id,

@Injectable()                    formalityName: eventData.data.formality.name,

export class PostgresEventStore implements IEventStore {                    state: eventData.data.state,

  constructor(                    createdAt: eventData.data.timeline.createdAt,

    @InjectRepository(EventStoreEntity, 'command')  // Command DB connection                    cache: { /* complex nested data */ }

    private eventRepo: Repository<EventStoreEntity>,                })

  ) {}

                await this.queryRepo.submittingDossierRepo.insert(queryModel)

  async append(aggregateId: string, events: DomainEvent[]): Promise<void> {            }

    const entities = events.map(event => ({        )

      aggregateId,    }

      eventType: event.eventType,}

      data: event.toObject(),```

      version: event.version,

      timestamp: event.timestamp,### 6.3. Database State After Create

    }));

    **Event Store (Command Side):**

    // Append-only, immutable

    await this.eventRepo.save(entities);```sql

  }mysql> SELECT * FROM submitting_dossier_events

       WHERE id = '01927f1c-3e8d-7890-abcd-0242ac120002';

  async getEventStream(aggregateId: string): Promise<DomainEvent[]> {

    const entities = await this.eventRepo.find({+----------+---------+---------------+-----------------+-------------------------+

      where: { aggregateId },| id       | version | created_at    | event_name      | data (snapshot)         |

      order: { version: 'ASC' },+----------+---------+---------------+-----------------+-------------------------+

    });| 01927f1c | 1       | 1730000000000 | DossierCreated  | {"id":"...","code":"..."|

    +----------+---------+---------------+-----------------+-------------------------+

    return entities.map(e => this.deserializeEvent(e));```

  }

**Query Model (Query Side):**

  async getAllEvents(): Promise<DomainEvent[]> {

    const entities = await this.eventRepo.find({```sql

      order: { timestamp: 'ASC' },mysql> SELECT id, code, department_name, applicant_name, state, created_at

    });       FROM submitting_dossier

           WHERE id = '01927f1c-3e8d-7890-abcd-0242ac120002';

    return entities.map(e => this.deserializeEvent(e));

  }+----------+--------------------+-----------------------+----------------+--------------------+---------------+

| id       | code               | department_name       | applicant_name | state              | created_at    |

  private deserializeEvent(entity: EventStoreEntity): DomainEvent {+----------+--------------------+-----------------------+----------------+--------------------+---------------+

    // Map event type to event class| 01927f1c | EVO-001-2024-00001 | Planning & Investment | John Doe       | PENDING_SUBMISSION | 1730000000000 |

    const EventClass = this.getEventClass(entity.eventType);+----------+--------------------+-----------------------+----------------+--------------------+---------------+

    return EventClass.fromObject(entity.data);```

  }

---

  private getEventClass(eventType: string): any {

    // Map event types to classes## 7. LIST RETRIEVAL FLOW (READ FLOW)

    const eventMap = {

      'UserRegisteredEvent': UserRegisteredEvent,### 7.1. Sequence Diagram - Query Flow

      'UserSignedInEvent': UserSignedInEvent,

      'PasswordChangedEvent': PasswordChangedEvent,```mermaid

      'UserLockedOutEvent': UserLockedOutEvent,sequenceDiagram

      'FailedSignInAttemptRecordedEvent': FailedSignInAttemptRecordedEvent,    actor Admin

      'UserUnlockedEvent': UserUnlockedEvent,    participant Controller

    };    participant Service

    return eventMap[eventType];    participant QueryRepo

  }    participant MySQL

}

```    Admin->>Controller: POST /submitting/list-dossier-by-admin

    Note over Controller: @GuardAdmin()<br/>Check permission

3. **Update Module**:

```typescript    Controller->>Service: handle(request)

// auth.module.ts

@Module({    Service->>Service: Build WHERE conditions

  imports: [    Service->>Service: Build ORDER BY

    TypeOrmModule.forFeature([EventStoreEntity], 'command'),  // Command DB    Service->>Service: Build LIMIT/OFFSET

  ],

  providers: [    Service->>QueryRepo: findAndCount(query)

    {    QueryRepo->>MySQL: SELECT with indexes

      provide: 'IEventStore',    MySQL-->>QueryRepo: [rows, total]

      useClass: PostgresEventStore,  // ← Use PostgreSQL instead of in-memory    QueryRepo-->>Service: Return results

    },

  ],    Service->>Service: Filter cache JSON fields

})    Service->>Service: Transform to DTOs

export class AuthModule {}

```    Service-->>Controller: {total, rows, page}

    Controller-->>Admin: 200 OK + pagination data

---```



#### 3. Add Internal vs Public Route Separation### 7.2. Implementation



**Goal**: Prepare for API Gateway#### **Step 1: HTTP Request**



**Steps**:```http

POST /api/v1/submitting/list-dossier-by-admin HTTP/1.1

1. **Create Internal Controller**:Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```typescriptContent-Type: application/json

// src/apps/auth/src/interfaces/http/controllers/auth-internal.controller.ts

{

@Controller('internal/auth')  // Internal routes  "page": 1,

export class AuthInternalController {  "limit": 20,

  constructor(  "state": "PENDING_SUBMISSION",

    private readonly queryBus: QueryBus,  "code": "EVO-001",

  ) {}  "formalityId": "formality-uuid-001",

  "departmentId": "dept-uuid-001",

  @Get('users/:id')  "applicantName": "John",

  async getUserById(@Param('id') id: string) {  "createdDateFrom": 1729900000000,

    // Internal endpoint for other services  "createdDateTo": 1730000000000,

    const query = new GetUserByIdQuery(id);  "sortBy": "createdAt",

    return await this.queryBus.execute(query);  "sortOrder": "DESC"

  }}

```

  @Get('users/by-username/:username')

  async getUserByUsername(@Param('username') username: string) {#### **Step 2: Service - Build Query**

    // Internal endpoint for other services

    const query = new GetUserByUsernameQuery(username);```typescript

    return await this.queryBus.execute(query);async handle(request: ListDossierByAdminRequest) {

  }    // ✅ Build WHERE clause

}    const where: FindOptionsWhere<SubmittingDossier> = {}

```

    if (request.state) where.state = Equal(request.state)

2. **Update Public Controller**:    if (request.code) where.code = Like(`%${request.code}%`)

```typescript    if (request.formalityId) where.formalityId = Equal(request.formalityId)

// src/apps/auth/src/interfaces/http/controllers/auth.controller.ts    if (request.departmentId) where.departmentId = Equal(request.departmentId)



@Controller('api/auth')  // Public routes (via API Gateway)    // Date range

export class AuthController {    if (request.createdDateFrom || request.createdDateTo) {

  @Post('register')        where.createdAt = Between(

  @HttpCode(HttpStatus.CREATED)            request.createdDateFrom || 0,

  async register(@Body() dto: RegisterUserDto) {            request.createdDateTo || Date.now()

    // Public endpoint        )

  }    }



  @Post('sign-in')    // Array filter

  @HttpCode(HttpStatus.OK)    if (request.categoryIds?.length) {

  async signIn(@Body() dto: SignInDto) {        where.categoryId = In(request.categoryIds)

    // Public endpoint    }

  }

    // ✅ Build ORDER BY

  @Post('change-password')    const order: any = {}

  @HttpCode(HttpStatus.OK)    order[request.sortBy || 'createdAt'] = request.sortOrder || 'DESC'

  async changePassword(@Body() dto: ChangePasswordDto) {    order.id = 'DESC'  // Secondary sort

    // Public endpoint

  }    // ✅ Pagination

}    const page = request.page || 1

```    const take = request.limit || 20

    const skip = (page - 1) * take

3. **Update Module**:

```typescript    // ✅ Execute query

// auth.module.ts    const [rows, total] = await this.queryRepo.submittingDossierRepo.findAndCount({

@Module({        where,

  controllers: [        order,

    AuthController,        // Public routes        skip,

    AuthInternalController,  // Internal routes        take,

  ],    })

})

export class AuthModule {}    // ✅ Filter cache JSON fields

```    let filteredRows = rows



---    if (request.applicantName) {

        filteredRows = filteredRows.filter(row =>

### 5.2 Priority 2: Medium Priority (Before Scaling)            row.applicantName?.toLowerCase()

                .includes(request.applicantName.toLowerCase())

#### 4. Implement API Gateway        )

    }

**Options**:

1. **NestJS API Gateway** (simple, TypeScript)    if (request.formalityName) {

2. **Kong** (production-ready, feature-rich)        filteredRows = filteredRows.filter(row =>

3. **AWS API Gateway** (cloud-native)            row.cache?.formality?.name?.toLowerCase()

                .includes(request.formalityName.toLowerCase())

**Example with NestJS**:        )

```typescript    }

// src/apps/gateway/src/gateway.controller.ts

    // ✅ Transform to DTO

@Controller('api')    return {

export class GatewayController {        total,

  constructor(        totalPage: Math.ceil(total / take),

    @Inject('AUTH_SERVICE') private authService: ClientProxy,        page,

    @Inject('USER_SERVICE') private userService: ClientProxy,        rows: filteredRows.map(row => ListDossierByAdminItem.fromEntity(row))

    @Inject('ORDER_SERVICE') private orderService: ClientProxy,    }

  ) {}}

```

  // Auth routes

  @Post('auth/register')#### **Step 3: Generated SQL**

  async register(@Body() dto: RegisterUserDto) {

    return this.authService.send({ cmd: 'register' }, dto);```sql

  }-- Main query

SELECT

  @Post('auth/sign-in')    d.id, d.code, d.department_id, d.department_name,

  async signIn(@Body() dto: SignInDto) {    d.applicant_name, d.formality_id, d.formality_name,

    return this.authService.send({ cmd: 'sign-in' }, dto);    d.state, d.created_at, d.submitted_at, d.cache

  }FROM submitting_dossier d

WHERE

  // User routes    d.state = 'PENDING_SUBMISSION'

  @Get('users/:id')    AND d.code LIKE '%EVO-001%'

  async getUser(@Param('id') id: string) {    AND d.formality_id = 'formality-uuid-001'

    return this.userService.send({ cmd: 'get-user' }, { id });    AND d.department_id = 'dept-uuid-001'

  }    AND d.created_at BETWEEN 1729900000000 AND 1730000000000

ORDER BY d.created_at DESC, d.id DESC

  // Order routesLIMIT 20 OFFSET 0;

  @Post('orders')

  async createOrder(@Body() dto: CreateOrderDto) {-- Count query

    return this.orderService.send({ cmd: 'create-order' }, dto);SELECT COUNT(*) as total

  }FROM submitting_dossier d

}WHERE

```    d.state = 'PENDING_SUBMISSION'

    AND d.code LIKE '%EVO-001%'

---    AND d.formality_id = 'formality-uuid-001'

    AND d.department_id = 'dept-uuid-001'

#### 5. Add Saga Pattern for Distributed Transactions    AND d.created_at BETWEEN 1729900000000 AND 1730000000000;

```

**When**: After implementing User Service and Order Service

**Performance:**

**Example**: Create Order Saga- ✅ Uses indexes on: `state`, `code`, `formality_id`, `department_id`, `created_at`

```typescript- ✅ No JOINs needed (denormalized)

// src/apps/order/src/sagas/create-order.saga.ts- ✅ Fast response: ~50-200ms



@Injectable()#### **Step 4: Response**

export class CreateOrderSaga {

  constructor(```json

    private readonly eventBus: IEventBus,{

    private readonly inventoryClient: IInventoryService,  "total": 150,

    private readonly paymentClient: IPaymentService,  "totalPage": 8,

  ) {}  "page": 1,

  "rows": [

  @Saga()    {

  async onOrderCreated(event: OrderCreatedEvent) {      "id": "01927f1c-3e8d-7890-abcd-0242ac120002",

    // Step 1: Reserve inventory      "code": "EVO-001-2024-00001",

    try {      "name": "Business License Application - John Doe",

      await this.inventoryClient.reserve(event.items);      "state": "PENDING_SUBMISSION",

    } catch (error) {      "createdAt": 1730000000000,

      // Compensation: Cancel order      "applicantName": "John Doe",

      await this.eventBus.publish(new OrderCancelledEvent(event.orderId));      "formalityName": "Business License Application",

      return;      "departmentName": "Planning & Investment Department",

    }      "totalAmount": 100000

    }

    // Step 2: Process payment    // ... 19 more items

    try {  ]

      await this.paymentClient.charge(event.userId, event.total);}

    } catch (error) {```

      // Compensation: Release inventory

      await this.inventoryClient.release(event.items);---

      await this.eventBus.publish(new OrderCancelledEvent(event.orderId));

      return;## 8. DATABASE DESIGN

    }

### 8.1. Naming Conventions

    // Success: Confirm order

    await this.eventBus.publish(new OrderConfirmedEvent(event.orderId));| Level | Convention | Example |

  }|-------|------------|---------|

}| **Database** | snake_case | `evo_command`, `evo_query` |

```| **Table** | **plural** snake_case + **service prefix** | `submitting_dossier`, `organizing_employees` |

| **Column** | snake_case | `created_at`, `department_id` |

---| **TypeORM Entity** | camelCase | `createdAt`, `departmentId` |



#### 6. Add Retry Logic and Dead Letter Queue### 8.2. Command vs Query Schema



**Goal**: Handle projection failures**Command Side (Event Store):**

```sql

**Implementation**:CREATE TABLE {entity}_events (

```typescript    id VARCHAR(36) PRIMARY KEY,

// src/apps/auth/src/infra/event-bus/event-bus.service.ts    version INT NOT NULL,

    created_at BIGINT NOT NULL,

@Injectable()    event_name VARCHAR(255),

export class EventBusService implements IEventBus {    event_payload JSON,        -- Event data

  private readonly MAX_RETRIES = 3;    data JSON,                 -- Full state snapshot

  private readonly RETRY_DELAY_MS = 1000;    INDEX idx_created_at (created_at)

);

  async publishAggregateEvents(aggregate: UserAggregate): Promise<void> {```

    const events = aggregate.getUncommittedEvents();

**Query Side (Denormalized):**

    // 1. Save to Event Store (must succeed)```sql

    await this.eventStore.append(aggregate.id, events);CREATE TABLE {service}_{entity} (

    id VARCHAR(36) PRIMARY KEY,

    // 2. Update projections with retry

    for (const event of events) {    -- Denormalized fields for queries

      await this.updateProjectionWithRetry(event);    code VARCHAR(128) UNIQUE,

    }    department_id VARCHAR(36),

    department_name VARCHAR(256),

    // 3. Publish to message broker with retry    applicant_name VARCHAR(256),

    for (const event of events) {    state VARCHAR(64),

      await this.publishToMessageBrokerWithRetry(event);

    }    -- Timestamps

    created_at BIGINT,

    // 4. Mark events as committed    updated_at BIGINT,

    aggregate.markEventsAsCommitted();

  }    -- Cache for complex data

    cache JSON,

  private async updateProjectionWithRetry(event: DomainEvent): Promise<void> {

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {    -- Indexes for fast queries

      try {    INDEX idx_code (code),

        if (this.userProjection) {    INDEX idx_department_id (department_id),

          await this.userProjection.handleEvent(event);    INDEX idx_state (state),

        }    INDEX idx_created_at (created_at)

        if (this.signInHistoryProjection) {);

          await this.signInHistoryProjection.handleEvent(event);```

        }

        return;  // Success### 8.3. Migration Strategy

      } catch (error) {

        console.error(`[EventBus] Projection update failed (attempt ${attempt}/${this.MAX_RETRIES}):`, error);```bash

        # Generate migration

        if (attempt === this.MAX_RETRIES) {pnpm migration:generate organizing AddEmployeeFields

          // Send to dead letter queue

          await this.sendToDeadLetterQueue(event, error);# Run migration

        } else {pnpm migration:run organizing

          // Wait before retry

          await this.sleep(this.RETRY_DELAY_MS * attempt);# Rollback

        }pnpm typeorm migration:revert

      }```

    }

  }---



  private async publishToMessageBrokerWithRetry(event: DomainEvent): Promise<void> {## 9. API DESIGN PATTERNS

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {

      try {### 9.1. Endpoint Convention

        await this.messageBroker.publish({

          eventType: event.eventType,**❗ IMPORTANT: ALL APIS USE POST METHOD**

          aggregateId: event.aggregateId,

          timestamp: event.timestamp,```

          data: event.toObject(),Format: POST /{service}/{resource}/{action}

          version: event.version,

        });✅ Correct:

        return;  // SuccessPOST /auth/admin/sign-in

      } catch (error) {POST /configuring/formality/create

        console.error(`[EventBus] Message broker publish failed (attempt ${attempt}/${this.MAX_RETRIES}):`, error);POST /organizing/department/list-by-admin

        POST /submitting/dossier/update-by-citizen

        if (attempt === this.MAX_RETRIES) {

          // Send to dead letter queue❌ Wrong (not used):

          await this.sendToDeadLetterQueue(event, error);GET /configuring/formality/list

        } else {PUT /organizing/department/123

          // Wait before retryDELETE /submitting/dossier/456

          await this.sleep(this.RETRY_DELAY_MS * attempt);```

        }

      }### 9.2. DTO Pattern

    }

  }```typescript

// Request DTO with validation

  private async sendToDeadLetterQueue(event: DomainEvent, error: Error): Promise<void> {export class CreateDossierRequest {

    // TODO: Implement dead letter queue (RabbitMQ DLQ, SQS DLQ, database table)    @IsRequiredString(1, 256, { trim: true })

    console.error(`[EventBus] Event sent to dead letter queue:`, {    name: string

      eventType: event.eventType,

      aggregateId: event.aggregateId,    @IsUuid(true)

      error: error.message,    formalityId: string

    });

  }    @ValidateNested()

    @Type(() => ApplicantInfoDto)

  private sleep(ms: number): Promise<void> {    applicant: ApplicantInfoDto

    return new Promise(resolve => setTimeout(resolve, ms));

  }    @IsArray()

}    @ValidateNested({ each: true })

```    @Type(() => ProfileComponentDto)

    profileComponents: ProfileComponentDto[]

---}



### 5.3 Priority 3: Low Priority (Nice to Have)// Response DTO

export class CreateDossierResponse {

#### 7. Add Metrics and Monitoring    dossierId: string

}

**Tools**: Prometheus, Grafana, Datadog```



**Example**:### 9.3. Controller Pattern

```typescript

// src/apps/auth/src/infra/event-bus/event-bus.service.ts```typescript

@Controller()

@Injectable()@GuardCitizen()  // or @GuardAdmin(PERMISSION_NAME)

export class EventBusService implements IEventBus {export class CitizenCreatingController {

  async publishAggregateEvents(aggregate: UserAggregate): Promise<void> {    @ApiOperation({ summary: 'API for creating dossier by citizen' })

    const startTime = Date.now();    @ApiOkResponse({ type: CreateDossierResponse })

        @Post('/submitting/create-dossier-by-citizen')

    try {    async createDossier(

      // ... existing code ...        @Body() request: CreateDossierRequest,

              @Citizen() citizen: CitizenInfoDto

      // Metrics: Success    ): Promise<CreateDossierResponse> {

      this.metrics.increment('event_bus.publish.success', {        return await this.service.handle(request, citizen)

        aggregateType: 'UserAggregate',    }

        eventCount: events.length,}

      });```

      this.metrics.histogram('event_bus.publish.duration', Date.now() - startTime);

    } catch (error) {---

      // Metrics: Error

      this.metrics.increment('event_bus.publish.error', {## 10. BEST PRACTICES

        aggregateType: 'UserAggregate',

        error: error.message,### 10.1. Service Communication

      });

      throw error;**✅ DO:**

    }```typescript

  }// Always set timeout

}const { ok, response } = await Service.request(

```    communicatorService,

    request,

---    { timeout: 3000, traceId: ctx.traceId }

)

#### 8. Add Caching for Read Models

// Always check ok and response

**Goal**: Reduce database queriesif (!ok || !response) return throwServerError()



**Example**:// Use parallel requests

```typescriptconst [user, dept] = await Promise.all([

// src/apps/auth/src/cqrs/query-handlers/query-handlers.ts    GetUserService.request(...),

    GetDepartmentService.request(...)

@Injectable()])

export class GetUserByIdQueryHandler {```

  constructor(

    @InjectRepository(UserReadModel, 'query')**❌ DON'T:**

    private readonly userRepo: Repository<UserReadModel>,```typescript

    private readonly cacheManager: Cache,  // Redis cache// No timeout

  ) {}await Service.request(communicatorService, request)



  async execute(query: GetUserByIdQuery): Promise<UserReadModel | null> {// Not checking response

    const cacheKey = `user:${query.userId}`;const { response } = await Service.request(...)

    return response.data  // ❌ might be null

    // 1. Try cache first

    const cached = await this.cacheManager.get<UserReadModel>(cacheKey);// Sequential when can be parallel

    if (cached) {const user = await GetUserService.request(...)

      return cached;const dept = await GetDepartmentService.request(...)

    }```



    // 2. Query database### 10.2. Event Sourcing

    const user = await this.userRepo.findOne({

      where: { id: query.userId },**✅ DO:**

    });```typescript

    // Wrap projection with alertService

    // 3. Cache result@OnEvent(DossierCreated.name)

    if (user) {async handleDossierCreated(event) {

      await this.cacheManager.set(cacheKey, user, { ttl: 60 });  // 60 seconds    await this.alertService.projectionWrapper(

    }        'submitting',

            DossierCreated.name,

    return user;        event,

  }        async (e) => {

}            await this.updateQueryModel(e)

```        }

    )

---}



## Summary// Idempotent projections

await this.queryRepo.dossier.upsert({ id, ... }, ['id'])

### ✅ Current Status```



| Aspect | Status | Notes |**❌ DON'T:**

|--------|--------|-------|```typescript

| Clean Architecture | ✅ Implemented | 5 layers clearly separated |// No error handling - crashes app

| CQRS + Event Sourcing | ✅ Implemented | Command/Query separation, Event Store, Projections |@OnEvent(DossierCreated.name)

| Microservice Architecture | 🔄 Partial | Auth Service complete, User/Order services planned |async handleDossierCreated(event) {

| Database per Service | ✅ Implemented | auth_command_db + auth_query_db |    await this.queryRepo.dossier.insert({ ... })  // ❌

| Event-Driven Communication | ✅ Implemented | EventBus → MessageBroker |}

| Bounded Contexts | ✅ Implemented | Auth Service domain isolated |

| API Gateway | ❌ Not Implemented | Services expose public routes directly |// Not idempotent

| Saga Pattern | ❌ Not Implemented | Not needed yet (single service) |await this.queryRepo.dossier.insert({ ... })  // ❌ duplicate key error

```

### 🔧 Priority Refactoring Tasks

### 10.3. Error Handling

1. **High Priority** (Before Production):

   - Move EventBusService to infrastructure layer```typescript

   - Create IEventBus port interface// Use typed errors

   - Implement PostgreSQL Event StorethrowObjectNotFound('Formality not found')

   - Add internal vs public route separationthrowBadRequest('Formality code already exists')

throwServerError()

2. **Medium Priority** (Before Scaling):throwException({ code: 'CUSTOM_ERROR', message: 'Custom message' })

   - Implement API Gateway

   - Add Saga pattern (when multiple services exist)// Handle service errors

   - Add retry logic and dead letter queueif (!ok) {

    if (code === Service.NOT_FOUND_CODE) {

3. **Low Priority** (Nice to Have):        return throwObjectNotFound()

   - Add metrics and monitoring    }

   - Add caching for read models    if (code === Service.UNAUTHORIZED_CODE) {

   - Implement distributed tracing        return throwUnauthorized()

    }

### 📚 Next Steps    return throwServerError()

}

1. ✅ Documentation consolidated (COMPLETED)```

2. ✅ Pattern mapping analyzed (THIS DOCUMENT)

3. 📋 Refactor code based on recommendations (NEXT)### 10.4. Performance Optimization

4. 📋 Implement User Service with bounded context

5. 📋 Implement Order Service with Saga pattern```typescript

6. 📋 Add API Gateway// ✅ Use Redis cache

7. 📋 Add monitoring and alertingconst cached = await this.cacheRepo.get(key)

if (cached) return cached

---

const data = await this.queryRepo.find(...)

**Last Updated**: 2025-01-XX  await this.cacheRepo.set(key, data, 600)  // 10min TTL

**Author**: Architecture Analysis

**Status**: Ready for Refactoring// ✅ Select only needed fields

await repo.find({
    select: ['id', 'name', 'code'],
    where: { state: STATE.ACTIVE }
})

// ✅ Use pagination
await repo.find({
    skip: (page - 1) * pageSize,
    take: pageSize
})

// ✅ Use transactions for multiple writes
await this.dataSource.transaction(async manager => {
    await this.commandRepo.entity1.commit(agg1, event1, { manager })
    await this.commandRepo.entity2.commit(agg2, event2, { manager })
})
```

### 10.5. Code Organization

```
features/{domain}/{action}/{use-case}/
├── {use-case}.service.ts     # Main logic
├── {use-case}.dto.ts          # Request/Response DTOs
├── {use-case}.module.ts       # NestJS module
├── prepare-data.ts            # Validation (optional)
└── {use-case}.service.spec.ts # Unit tests
```

---

## 📚 REFERENCES

### Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [NATS Documentation](https://docs.nats.io/)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

### Internal Docs
- `API_DEVELOPMENT_GUIDE.md` - Hướng dẫn phát triển API
- `CLAUDE.md` - Hướng dẫn cho AI assistant
- `migration.md` - Database migration guide
- `queue.md` - Queue & message handling

### Project Scripts
```bash
# Development
pnpm dev {service}           # Start single service
pnpm dev:all                 # Start all services

# Code generation
pnpm gen:feature {path} {FeatureName}  # Generate feature scaffold
pnpm gen:fm {service}                   # Export features

# Database
pnpm migration:generate {service} {MigrationName}
pnpm migration:run {service}

# Testing
pnpm test                    # Run all tests
pnpm test:cov                # Coverage report

# Build
pnpm build {service}         # Build specific service
```

---

**Document Version**: 1.0
**Last Updated**: October 2024
**Maintainer**: EVO Development Team

---

© 2024 Mobifone - EVO Microservice API

````
