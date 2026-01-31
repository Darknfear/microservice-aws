import { ConfigurationModule } from '@/libs/core/configuration/configuration.module';
import { MessageBrokerModule } from '@/libs/message-broker/message-broker.module';
import { Module } from '@nestjs/common';

// Event Store (Command DB)
import { InMemoryEventStore } from './src/infrastructure/persistence/event-store/adapters/in-memory-event-store';

// Read Models (Query DB)

// Services
import { PasswordService } from './src/infrastructure/security/password.service';

// Event Bus (Infrastructure)
import { EventBusService } from './src/infrastructure/messaging/event-bus.service';

// ========== APPLICATION LAYER (CQRS) ==========
// Command Handlers
import { ChangePasswordCommandHandler } from './src/application/commands/handlers/change-password.command-handler';
import { CreateUserCommandHandler } from './src/application/commands/handlers/create-user.command-handler';
import { SignInCommandHandler } from './src/application/commands/handlers/sign-in.command-handler';

// Query Handlers

// Projections (Event Handlers for Read Models)

// ========== PRESENTATION LAYER ==========
// Controllers
import { AuthController } from './src/presentation/http/controllers/auth.controller';

/**
 * Auth Module with CQRS + Event Sourcing
 *
 * Architecture:
 * - Command Side: Commands → Command Handlers → Aggregates → Events → Event Store (Command DB)
 * - Query Side: Queries → Query Handlers → Read Models (Query DB)
 * - Projections: Events from Event Store → Update Read Models → Eventual Consistency
 *
 * Databases:
 * - Command DB (Event Store): Append-only, immutable event log
 * - Query DB (Read Models): Denormalized views, optimized for reads
 */
@Module({
  imports: [
    ConfigurationModule,
    MessageBrokerModule.forRoot(),

    // Query DB: Read Models connection
    // NOTE: Uncomment this when you have PostgreSQL running
    // TypeOrmModule.forRootAsync({
    //   name: 'queryConnection',
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get<string>('DB_HOST', 'localhost'),
    //     port: configService.get<number>('DB_PORT', 5432),
    //     username: configService.get<string>('DB_USERNAME', 'postgres'),
    //     password: configService.get<string>('DB_PASSWORD', 'postgres'),
    //     database: configService.get<string>('DB_NAME', 'auth_db'),
    //     entities: [UserReadModel, SignInHistoryReadModel],
    //     synchronize: configService.get<string>('NODE_ENV') === 'dev',
    //   }),
    //   inject: [ConfigService],
    // }),
    // TypeOrmModule.forFeature(
    //   [UserReadModel, SignInHistoryReadModel],
    //   'queryConnection',
    // ),
  ],
  controllers: [
    AuthController, // Public routes: /api/auth/*
    // AuthInternalController, // Internal routes: /internal/auth/* (commented - needs database)
  ],
  providers: [
    // ========== EVENT STORE (Command DB) ==========
    {
      provide: 'IEventStore',
      useClass: InMemoryEventStore, // Development: In-Memory Event Store (no DB needed)
      // For production, use: PostgresEventStore
    },

    // ========== EVENT BUS ==========
    {
      provide: 'IEventBus',
      useClass: EventBusService,
    },

    // ========== INFRASTRUCTURE SERVICES ==========
    {
      provide: 'IPasswordService',
      useClass: PasswordService,
    },

    // ========== COMMAND HANDLERS (Write Side) ==========
    SignInCommandHandler,
    CreateUserCommandHandler,
    ChangePasswordCommandHandler,

    // ========== QUERY HANDLERS (Read Side) ==========
    // NOTE: Commented out for in-memory development mode (no database)
    // Query handlers need database to read from Read Models
    // Uncomment when using PostgreSQL
    // GetUserQueryHandler,
    // GetUserByUsernameQueryHandler,
    // GetSignInHistoryQueryHandler,

    // ========== PROJECTIONS (Event Handlers for Read Models) ==========
    // NOTE: Commented out for in-memory development mode (no database)
    // Uncomment when using PostgreSQL for Read Models
    // {
    //   provide: 'UserProjection',
    //   useClass: UserProjection,
    // },
    // {
    //   provide: 'SignInHistoryProjection',
    //   useClass: SignInHistoryProjection,
    // },
  ],
  exports: [
    // Export command handlers for use in controllers
    SignInCommandHandler,
    CreateUserCommandHandler,
    ChangePasswordCommandHandler,

    // Export query handlers for use in controllers
    // NOTE: Commented out for in-memory development mode (no database)
    // GetUserQueryHandler,
    // GetUserByUsernameQueryHandler,
    // GetSignInHistoryQueryHandler,

    // Export event bus for use in other modules
    'IEventBus',

    // Export event store interface
    'IEventStore',
  ],
})
export class AuthModule {}
