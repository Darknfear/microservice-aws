<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🚀 EVO Microservice API

A high-performance microservices system built with **NestJS** and **Bun** runtime, implementing **CQRS + Event Sourcing** patterns for scalable online public services.

## 🌟 Features

- **⚡ Bun Runtime**: Ultra-fast JavaScript runtime for maximum performance
- **🏗️ NestJS Framework**: Scalable and maintainable architecture
- **🔄 CQRS + Event Sourcing**: Command Query Responsibility Segregation pattern
- **📊 FastAPI Integration**: High-performance HTTP server with Fastify
- **🗄️ Multi-Database Support**: MySQL, Redis, ScyllaDB/Cassandra
- **📨 Message Broker**: NATS for inter-service communication
- **🔍 Observability**: OpenTelemetry tracing and monitoring

## 🛠️ Technology Stack

- **Runtime**: Bun 1.1.38+
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **HTTP Server**: Fastify
- **Database**: MySQL 8.0, Redis, CQL
- **Message Broker**: NATS
- **Testing**: Bun Test + Jest
- **Build Tool**: Bun bundler

## 📋 Prerequisites

Before running this project, make sure you have:

- **Bun** >= 1.1.0 installed ([Install Bun](https://bun.sh/docs/installation))
- **Node.js** >= 20.0.0 (fallback compatibility)
- **Docker** & **Docker Compose** (for databases)

## 🚀 Quick Start

### Installation

# Clone the repository
git clone <repository-url>
cd evo-microservice-api

# Install dependencies using Bun
bun install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start development server (with hot reload)
bun run start:dev

# Start with Bun's built-in watch mode
bun --watch src/main.ts

# Start with NestJS CLI (alternative)
bun run start:nest:dev
```

### Production

```bash
# Build the application
bun run build

# Start production server
bun run start:prod
```

## 🧪 Testing

```bash
# Run tests with Bun's native test runner
bun test

# Run tests with Jest (alternative)
bun run test:jest

# Watch mode
bun test --watch

# Coverage report
bun run test:cov

# E2E tests
bun run test:e2e
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run start:dev` | Start development server with hot reload |
| `bun run start:prod` | Start production server |
| `bun run build` | Build application for production |
| `bun run test` | Run unit tests with Bun |
| `bun run test:watch` | Run tests in watch mode |
| `bun run lint` | Lint and fix code style |
| `bun run format` | Format code with Prettier |
| `bun run typecheck` | Type checking without emit |

## 🏗️ Project Structure

```
evo-microservice-api/
├── src/
│   ├── app.controller.ts      # Main application controller
│   ├── app.module.ts          # Root module
│   ├── app.service.ts         # Application service
│   └── main.ts               # Application entry point
├── test/
│   ├── setup.ts              # Test configuration
│   └── *.spec.ts             # Test files
├── bunfig.toml               # Bun configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## 🌐 API Endpoints

The API server runs on `http://localhost:3000/api/v1` by default.

### Health Check
```bash
GET /api/v1/
# Returns: Hello World!
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
