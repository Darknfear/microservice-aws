/**
 * Sign In Command Handler
 * Handles the SignInCommand and produces domain events
 *
 * CQRS Pattern:
 * - Command Handlers modify state (Write Model)
 * - They interact with Aggregates and Event Store
 * - They do NOT query Read Models
 *
 * Flow:
 * 1. Receive SignInCommand
 * 2. Load UserAggregate from Event Store
 * 3. Execute domain logic (aggregate.recordSignIn or recordFailedSignInAttempt)
 * 4. Publish events to Event Store
 * 5. Return command result
 */

import { SignInCommand } from '@apps/auth/src/application/commands/sign-in.command';
import type { IEventBus } from '@apps/auth/src/application/ports/event-bus/event-bus.interface';
import type { IEventStore } from '@apps/auth/src/application/ports/event-store/event-store.interface';
import { UserAggregate } from '@apps/auth/src/domain/aggregates/user.aggregate';
import {
  InactiveUserError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '@apps/auth/src/domain/errors';
import type { IPasswordService } from '@apps/auth/src/domain/repositories/services/password.service.interface';
import { Inject, Injectable } from '@nestjs/common';

export interface SignInCommandResult {
  success: boolean;
  userId?: string;
  username?: string;
  email?: string;
  message?: string;
}

@Injectable()
export class SignInCommandHandler {
  constructor(
    @Inject('IEventStore')
    private readonly eventStore: IEventStore,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  /**
   * Handle SignInCommand
   * This is the WRITE side - it produces events
   */
  async execute(command: SignInCommand): Promise<SignInCommandResult> {
    // 1. Find user aggregate by username from event store
    // Note: In production, you might need an index (username -> aggregateId)
    // For now, we'll get all events and find the user
    const allEvents = await this.eventStore.getAllEvents();
    const userRegisteredEvent = allEvents.find(
      (event) =>
        event.eventType === 'UserRegisteredEvent' && (event as any).username === command.username,
    );

    if (!userRegisteredEvent) {
      throw new UserNotFoundError(command.username);
    }

    const userId = userRegisteredEvent.aggregateId;

    // 2. Rebuild user aggregate from event stream
    const events = await this.eventStore.getEventStream(userId);
    const userAggregate = UserAggregate.fromEventStream(events);

    // 3. Check if user is active
    if (!userAggregate.isUserActive()) {
      // Record failed attempt due to inactive status
      userAggregate.recordFailedSignInAttempt(command.ipAddress);
      await this.eventBus.publishAggregateEvents(userAggregate);
      throw new InactiveUserError(command.username);
    }

    // 4. Verify password
    const isValidPassword = await this.passwordService.compare(
      command.password,
      userAggregate.passwordHash,
    );

    if (!isValidPassword) {
      // Record failed sign-in attempt
      userAggregate.recordFailedSignInAttempt(command.ipAddress);
      await this.eventBus.publishAggregateEvents(userAggregate);
      throw new InvalidCredentialsError(command.username);
    }

    // 5. Record successful sign-in
    userAggregate.recordSignIn(command.ipAddress, command.userAgent);

    // 6. Publish events to event store (Command DB)
    await this.eventBus.publishAggregateEvents(userAggregate);

    // 7. Return command result (not full user data - queries do that)
    return {
      success: true,
      userId: userAggregate.id,
      username: userAggregate.username,
      email: userAggregate.email,
      message: 'Sign in successful',
    };
  }
}
