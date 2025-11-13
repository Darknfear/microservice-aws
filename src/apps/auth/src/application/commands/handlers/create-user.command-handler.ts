/**
 * Create User Command Handler
 * Handles the CreateUserCommand and produces UserRegisteredEvent
 *
 * Flow:
 * 1. Receive CreateUserCommand
 * 2. Validate username doesn't exist
 * 3. Hash password
 * 4. Create UserAggregate (produces UserRegisteredEvent)
 * 5. Publish events to Event Store
 * 6. Return command result
 */

import { CreateUserCommand } from '@apps/auth/src/application/commands/create-user.command';
import type { IEventBus } from '@apps/auth/src/application/ports/event-bus/event-bus.interface';
import type { IEventStore } from '@apps/auth/src/application/ports/event-store/event-store.interface';
import { UserAggregate } from '@apps/auth/src/domain/aggregates/user.aggregate';
import { UserAlreadyExistsError } from '@apps/auth/src/domain/errors';
import type { IPasswordService } from '@apps/auth/src/domain/repositories/services/password.service.interface';
import { Inject, Injectable } from '@nestjs/common';

export interface CreateUserCommandResult {
  success: boolean;
  userId: string;
  username: string;
  email: string;
  message: string;
}

@Injectable()
export class CreateUserCommandHandler {
  constructor(
    @Inject('IEventStore')
    private readonly eventStore: IEventStore,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  /**
   * Handle CreateUserCommand
   * This is the WRITE side - it produces events
   */
  async execute(command: CreateUserCommand): Promise<CreateUserCommandResult> {
    // 1. Check if username already exists
    const allEvents = await this.eventStore.getAllEvents();
    const existingUser = allEvents.find(
      (event) =>
        event.eventType === 'UserRegisteredEvent' &&
        ((event as any).username === command.username || (event as any).email === command.email),
    );

    if (existingUser) {
      throw new UserAlreadyExistsError(command.username);
    }

    // 2. Hash password
    const passwordHash = await this.passwordService.hash(command.password);

    // 3. Create user aggregate (produces UserRegisteredEvent)
    const userAggregate = UserAggregate.create(command.username, command.email, passwordHash);

    // 4. Publish events to event store (Command DB)
    await this.eventBus.publishAggregateEvents(userAggregate);

    // 5. Return command result
    return {
      success: true,
      userId: userAggregate.id,
      username: userAggregate.username,
      email: userAggregate.email,
      message: 'User created successfully',
    };
  }
}
