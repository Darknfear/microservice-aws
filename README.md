# 🚀 Microservice Architecture - Clean + CQRS + Event Sourcing<p align="center">

<a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>

**Enterprise-grade microservices với NestJS, Bun, và modern patterns**</p>

---[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

## 📖 Quick Navigation

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

- **Auth Service Guide**: [`src/apps/auth/README.md`](./src/apps/auth/README.md) - Complete CQRS + Event Sourcing implementation <p align="center">

- **Shared Libraries**: [`src/libs/README.md`](./src/libs/README.md) - JWT, Message Broker, AWS, Base Classes<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

- **This File**: Overview của toàn bộ architecture<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

---<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

## 🎯 Architecture Overview<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

````<a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>

┌──────────────────────────────────────────────────────┐    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

│            API GATEWAY (Future)                      │  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>

│   - Load Balancing - Auth - Rate Limiting           │</p>

└──────────────────────────────────────────────────────┘  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

                        │  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

        ┌───────────────┼───────────────┐

        ▼               ▼               ▼# 🚀 EVO Microservice API

┌──────────────┐ ┌──────────────┐ ┌─────────────┐

│ Auth Service │ │ User Service │ │Order Service│A high-performance microservices system built with **NestJS** and **Bun** runtime, implementing **CQRS + Event Sourcing** patterns for scalable online public services.

│  (CQRS +ES) │ │   (Future)   │ │  (Future)   │

└──────────────┘ └──────────────┘ └─────────────┘## 📚 Architecture Documentation

        │               │               │

        └───────────────┴───────────────┘**🚀 NEW: Complete Event Sourcing Implementation!**

                        │

        ┌───────────────┴───────────────┐This project now includes a comprehensive implementation of **Event Sourcing** combined with **Clean Architecture**. Start here:

        │                               │

   Command DB                      Query DB1. **Quick Start** (5 min): Read [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)

  (Event Store)                (Read Models)2. **Complete Guide** (30 min): Read [`EVENT_SOURCING_ARCHITECTURE.md`](./src/apps/auth/EVENT_SOURCING_ARCHITECTURE.md)

    Append-only                 Denormalized3. **Visual Diagrams** (20 min): Read [`COMPLETE_FOLDER_STRUCTURE.md`](./COMPLETE_FOLDER_STRUCTURE.md)

```4. **Implementation Summary**: Read [`ARCHITECTURE_REFACTORING_SUMMARY.md`](./ARCHITECTURE_REFACTORING_SUMMARY.md)

5. **Verification**: Read [`IMPLEMENTATION_COMPLETE.md`](./IMPLEMENTATION_COMPLETE.md)

---

### What's Included

## 🏗️ Core Patterns- ✅ **Event Sourcing**: Immutable event store with complete audit trail

- ✅ **Clean Architecture**: 5-layer separation (domain, ports, usecases, infra, interfaces)

### 1. Microservice Architecture- ✅ **Domain Events**: 6 user authentication events with versioning

- ✅ **Aggregate Root**: UserAggregate pattern with business logic

| Pattern | Implementation | Status |- ✅ **Shared Libraries**: JWT, Message Broker, AWS SDK (reusable across services)

|---------|---------------|--------|- ✅ **Base Classes**: Entity, Repository, Usecase for extensibility

| **Database per Service** | Mỗi service có DB riêng | ✅ |- ✅ **Auto Account Lockout**: Locks after 5 failed sign-in attempts (recorded as events)

| **Event-Driven Communication** | Message Broker (RabbitMQ/Kafka) | ✅ |- ✅ **Complete Documentation**: English + Vietnamese guides (2500+ lines)

| **API Gateway** | Single entry point | 📋 Planned |

| **Service Discovery** | Dynamic registration | 📋 Planned |## 🌟 Features



### 2. Clean Architecture (5 Layers)- **⚡ Bun Runtime**: Ultra-fast JavaScript runtime for maximum performance

- **🏗️ NestJS Framework**: Scalable and maintainable architecture

```- **🔄 CQRS + Event Sourcing**: Command Query Responsibility Segregation pattern

┌─────────────────────────────────────┐- **📊 FastAPI Integration**: High-performance HTTP server with Fastify

│ INTERFACES (Controllers, DTOs)      │ ← HTTP/gRPC adapters- **🗄️ Multi-Database Support**: MySQL, Redis, ScyllaDB/Cassandra

├─────────────────────────────────────┤- **📨 Message Broker**: NATS for inter-service communication

│ USECASES (Business workflows)       │ ← Application logic- **🔍 Observability**: OpenTelemetry tracing and monitoring

├─────────────────────────────────────┤

│ PORTS (Interfaces/Contracts)        │ ← Abstractions## 🛠️ Technology Stack

├─────────────────────────────────────┤

│ DOMAIN (Entities, Events, VOs)      │ ← Business rules- **Runtime**: Bun 1.1.38+

├─────────────────────────────────────┤- **Framework**: NestJS 11.x

│ INFRASTRUCTURE (DB, External APIs)  │ ← Technical details- **Language**: TypeScript 5.7

└─────────────────────────────────────┘- **HTTP Server**: Fastify

```- **Database**: MySQL 8.0, Redis, CQL

- **Message Broker**: NATS

### 3. CQRS + Event Sourcing- **Testing**: Bun Test + Jest

- **Build Tool**: Bun bundler

````

WRITE (Commands):## 📋 Prerequisites

POST → Command → Handler → Aggregate → Events → Event Store

Before running this project, make sure you have:

READ (Queries):

GET → Query → Handler → Read Model → Fast response- **Bun** >= 1.1.0 installed ([Install Bun](https://bun.sh/docs/installation))

- **Node.js** >= 20.0.0 (fallback compatibility)

SYNC (Projections):- **Docker** & **Docker Compose** (for databases)

Event Store → Projection → Read Model → Eventual Consistency

```````## 🚀 Quick Start



---### Installation



## 📁 Project Structure# Clone the repository

git clone <repository-url>

```cd evo-microservice-api

microservice/

├── src/# Install dependencies using Bun

│   ├── apps/                    # Microservicesbun install

│   │   ├── auth/                # ✅ Auth Service (CQRS + ES)

│   │   │   ├── README.md        # 📖 Complete guide# Copy environment variables

│   │   │   └── src/cp .env.example .env

│   │   │       ├── cqrs/        # Commands, Queries, Projections```

│   │   │       ├── domain/      # Aggregates, Events, VOs

│   │   │       ├── ports/       # Interfaces### Development

│   │   │       ├── usecases/    # Application logic

│   │   │       ├── infra/       # DB, Event Store, Read Models```bash

│   │   │       └── interfaces/  # HTTP Controllers# Start development server (with hot reload)

│   │   ├── user/                # 📋 User Service (Planned)bun run start:dev

│   │   └── order/               # 📋 Order Service (Planned)

│   │# Start with Bun's built-in watch mode

│   └── libs/                    # Shared Librariesbun --watch src/main.ts

│       ├── README.md            # 📖 Libs documentation

│       ├── core/base/           # BaseEntity, BaseRepository, BaseUsecase# Start with NestJS CLI (alternative)

│       ├── jwt/                 # JWT Servicebun run start:nest:dev

│       ├── message-broker/      # Message Broker abstraction```

│       └── aws/                 # AWS SDK wrapper

│### Production

└── README.md                    # 📖 This file

``````bash

# Build the application

---bun run build



## 🔧 Services# Start production server

bun run start:prod

### Auth Service ✅```



**Implementation**: CQRS + Event Sourcing pattern## 🧪 Testing



**Features**:```bash

- User registration & sign-in# Run tests with Bun's native test runner

- Auto account lockout (5 failed attempts)bun test

- Complete audit trail via events

- Denormalized read models for fast queries# Run tests with Jest (alternative)

bun run test:jest

**API Endpoints**:

```bash# Watch mode

# Commands (Write)bun test --watch

POST /auth/register

POST /auth/sign-in# Coverage report

POST /auth/change-passwordbun run test:cov



# Queries (Read)# E2E tests

GET /auth/users/:idbun run test:e2e

GET /auth/users/by-username/:username```

GET /auth/users/:id/sign-in-history

```## 🔧 Available Scripts



**Tech Stack**:| Command | Description |

- 2 PostgreSQL databases (Command DB + Query DB)|---------|-------------|

- Event Store (append-only, immutable)| `bun run start:dev` | Start development server with hot reload |

- Read Models (denormalized, optimized)| `bun run start:prod` | Start production server |

- Projections (eventual consistency)| `bun run build` | Build application for production |

| `bun run test` | Run unit tests with Bun |

📖 **Full Documentation**: [`src/apps/auth/README.md`](./src/apps/auth/README.md)| `bun run test:watch` | Run tests in watch mode |

| `bun run lint` | Lint and fix code style |

---| `bun run format` | Format code with Prettier |

| `bun run typecheck` | Type checking without emit |

## 📦 Shared Libraries

## 🏗️ Project Structure

📖 **Full Documentation**: [`src/libs/README.md`](./src/libs/README.md)

```````

### Quick Referenceevo-microservice-api/

├── src/

````typescript│ ├── app.controller.ts      # Main application controller

// 1. Base Classes│   ├── app.module.ts          # Root module

import { BaseEntity, BaseRepository, BaseUsecase } from '@/libs/core/base';│   ├── app.service.ts         # Application service

│   └── main.ts               # Application entry point

// 2. JWT Service├── test/

import { JwtService } from '@/libs/jwt/jwt.service';│   ├── setup.ts              # Test configuration

const { accessToken, refreshToken } = await jwtService.generateTokens({ userId });│   └── *.spec.ts             # Test files

├── bunfig.toml               # Bun configuration

// 3. Message Broker├── package.json              # Dependencies and scripts

import { MessageBrokerService } from '@/libs/message-broker/message-broker.service';└── tsconfig.json             # TypeScript configuration

await messageBroker.publish({ eventType: 'UserSignedIn', data });```



// 4. AWS Service## 🌐 API Endpoints

import { AwsService } from '@/libs/aws/aws.service';

await awsService.uploadToS3({ bucket, key, body });The API server runs on `http://localhost:3000/api/v1` by default.

````

### Health Check

---```bash

GET /api/v1/

## 🚀 Getting Started# Returns: Hello World!

````

### Prerequisites

## Deployment

```bash

# Install BunWhen you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

curl -fsSL https://bun.sh/install | bash

bun --version  # >= 1.1.38If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

````

````bash

### Installation$ pnpm install -g @nestjs/mau

$ mau deploy

```bash```

git clone <repo-url>

cd microserviceWith Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

bun install

cp .env.example .env## Resources

````

Check out a few resources that may come in handy when working with NestJS:

### Run Services

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

```bash- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

# Development with hot reload- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).

bun run dev --service=auth- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

# Production- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

bun run build && bun run start:prod- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

# Tests

bun test## Support

```

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

---

## Stay in touch

## 🔀 Microservice vs Clean Architecture

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)

### Pattern Mapping- Website - [https://nestjs.com](https://nestjs.com/)

- Twitter - [@nestframework](https://twitter.com/nestframework)

| Clean Architecture | Microservice Pattern | Resolution |

|-------------------|----------------------|------------|## License

| Domain Layer | Service Logic | ✅ Same concept |

| Infrastructure | Database per Service | ✅ Compatible |Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

| Usecases | Service Boundaries | ⚠️ Don't call external services |
| Ports | API Contracts | ✅ Define interfaces |
| Interfaces | API Gateway | ⚠️ Avoid duplicate routing |

### Key Solutions

#### ✅ Problem 1: Usecase không nên gọi external services

**Solution**: Event-Driven Communication

```typescript
// ❌ BAD: Usecase calls external service
class SignInUsecase {
  async execute() {
    await this.httpClient.get('http://user-service/profile'); // ❌
  }
}

// ✅ GOOD: Emit events instead
class SignInUsecase {
  async execute() {
    user.recordSignIn();
    await this.eventBus.publish(new UserSignedInEvent(user.id)); // ✅
  }
}

// Other service listens to event
class UserProfileProjection {
  @EventHandler('UserSignedInEvent')
  async handle(event) {
    await this.updateLastSeen(event.userId);
  }
}
```

#### ✅ Problem 2: Shared Domain Logic

**Solution**: Bounded Contexts

```typescript
// ❌ BAD: Shared entity across services
// common/entities/user.entity.ts
export class User {} // ❌ Tight coupling

// ✅ GOOD: Separate contexts
// auth/domain/entities/user-aggregate.ts
export class UserAggregate {
  passwordHash: string; // Auth-specific
}

// user/domain/entities/user-profile.ts
export class UserProfile {
  bio: string; // Profile-specific
}

// order/domain/entities/customer.ts
export class Customer {
  shippingAddress: string; // Order-specific
}
```

#### ✅ Problem 3: Database Access

**Solution**: API Call or Denormalized Read Models

```typescript
// ❌ BAD: Cross-database query
const result = await db.query(`
  JOIN auth_db.users u ON o.user_id = u.id  -- ❌
`);

// ✅ GOOD: Denormalized Read Model
class OrderReadModel {
  id: string;
  userId: string;
  username: string; // Denormalized
}

class OrderProjection {
  @EventHandler('UserRegisteredEvent')
  async onUserRegistered(event) {
    await this.orderReadModel.updateUsername(event.userId, event.username);
  }
}
```

---

## 📋 Best Practices

### 1. Service Independence

- ✅ Each service has own domain
- ✅ Each service has own database
- ✅ Services communicate via events
- ❌ No shared domain entities
- ❌ No direct DB access to other services

### 2. Event-Driven Communication

- Prefer events over synchronous API calls
- Use message broker for async communication
- Implement eventual consistency

### 3. Bounded Contexts

- Define clear boundaries
- Auth Context: Authentication, Authorization
- User Context: Profile, Preferences
- Order Context: Orders, Payments

---

## 🛠️ Tech Stack

| Category       | Technology      | Version |
| -------------- | --------------- | ------- |
| Runtime        | Bun             | 1.1.38+ |
| Framework      | NestJS          | 11.x    |
| Language       | TypeScript      | 5.7     |
| Database       | PostgreSQL      | 14+     |
| Message Broker | RabbitMQ/Kafka  | -       |
| Testing        | Bun Test + Jest | -       |

---

## 📚 Documentation

- **Main README**: This file
- **Auth Service**: [`src/apps/auth/README.md`](./src/apps/auth/README.md)
- **Shared Libs**: [`src/libs/README.md`](./src/libs/README.md)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

**Built with ❤️ using NestJS, Bun, Clean Architecture, CQRS, and Event Sourcing**
