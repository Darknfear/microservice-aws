/**
 * Change Password Command Handler
 * Handles the ChangePasswordCommand and produces PasswordChangedEvent
 */

import { ChangePasswordCommand } from '@apps/auth/src/application/commands/change-password.command';
import type { IEventBus } from '@apps/auth/src/application/ports/event-bus/event-bus.interface';
import type { IEventStore } from '@apps/auth/src/application/ports/event-store/event-store.interface';
import { UserAggregate } from '@apps/auth/src/domain/aggregates/user.aggregate';
import { InvalidCredentialsError, UserNotFoundError } from '@apps/auth/src/domain/errors';
import type { IPasswordService } from '@apps/auth/src/domain/repositories/services/password.service.interface';
import { Inject, Injectable } from '@nestjs/common';

export interface ChangePasswordCommandResult {
  success: boolean;
  userId: string;
  message: string;
}

@Injectable()
export class ChangePasswordCommandHandler {
  constructor(
    @Inject('IEventStore')
    private readonly eventStore: IEventStore,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<ChangePasswordCommandResult> {
    // 1. Rebuild user aggregate from event stream
    const events = await this.eventStore.getEventStream(command.userId);
    if (events.length === 0) {
      throw new UserNotFoundError(command.userId);
    }

    const userAggregate = UserAggregate.fromEventStream(events);

    // 2. Verify current password
    const isValidPassword = await this.passwordService.compare(
      command.currentPassword,
      userAggregate.passwordHash,
    );

    if (!isValidPassword) {
      throw new InvalidCredentialsError('Current password is incorrect');
    }

    // 3. Hash new password
    const newPasswordHash = await this.passwordService.hash(command.newPassword);

    // 4. Change password (produces PasswordChangedEvent)
    userAggregate.changePassword(userAggregate.passwordHash, newPasswordHash);

    // 5. Publish events to event store
    await this.eventBus.publishAggregateEvents(userAggregate);

    return {
      success: true,
      userId: userAggregate.id,
      message: 'Password changed successfully',
    };
  }
}
