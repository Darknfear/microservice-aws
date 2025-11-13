/**
 * User Domain Events
 * Events that occur in the user aggregate
 *
 * Event Sourcing Principle:
 * - Immutable events record all state changes
 * - Events are the source of truth
 * - Current state is derived from replaying events
 */

import { DomainEvent } from '@/libs/core/base';

/**
 * Event: User Registered
 * Fired when a new user is created in the system
 */
export class UserRegisteredEvent extends DomainEvent {
  readonly eventType = 'user.registered' as const;

  constructor(
    aggregateId: string,
    version: number,
    readonly username: string,
    readonly email: string,
    readonly passwordHash: string,
  ) {
    super(aggregateId, version, { source: 'auth-service' });
  }

  toObject() {
    return {
      ...super.toObject(),
      username: this.username,
      email: this.email,
      passwordHash: this.passwordHash,
    };
  }
}

/**
 * Event: User Signed In
 * Fired when a user successfully authenticates
 */
export class UserSignedInEvent extends DomainEvent {
  readonly eventType = 'user.signed-in' as const;

  constructor(
    aggregateId: string,
    version: number,
    readonly username: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
  ) {
    super(aggregateId, version, { source: 'auth-service' });
  }

  toObject() {
    return {
      ...super.toObject(),
      username: this.username,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
    };
  }
}

/**
 * Event: User Deactivated
 * Fired when a user account is deactivated
 */
export class UserDeactivatedEvent extends DomainEvent {
  readonly eventType = 'user.deactivated' as const;

  constructor(
    aggregateId: string,
    version: number,
    readonly reason?: string,
  ) {
    super(aggregateId, version, { source: 'auth-service' });
  }

  toObject() {
    return {
      ...super.toObject(),
      reason: this.reason,
    };
  }
}

/**
 * Event: User Reactivated
 * Fired when a user account is reactivated
 */
export class UserReactivatedEvent extends DomainEvent {
  readonly eventType = 'user.reactivated' as const;

  constructor(aggregateId: string, version: number) {
    super(aggregateId, version, { source: 'auth-service' });
  }
}

/**
 * Event: Password Changed
 * Fired when a user changes their password
 */
export class PasswordChangedEvent extends DomainEvent {
  readonly eventType = 'user.password-changed' as const;

  constructor(
    aggregateId: string,
    version: number,
    readonly oldPasswordHash: string,
    readonly newPasswordHash: string,
  ) {
    super(aggregateId, version, { source: 'auth-service' });
  }

  toObject() {
    return {
      ...super.toObject(),
      oldPasswordHash: this.oldPasswordHash,
      newPasswordHash: this.newPasswordHash,
    };
  }
}

/**
 * Event: Invalid Sign-In Attempt
 * Fired when a user attempts to sign in with wrong credentials
 */
export class InvalidSignInAttemptEvent extends DomainEvent {
  readonly eventType = 'user.invalid-sign-in-attempt' as const;

  constructor(
    aggregateId: string,
    version: number,
    readonly attemptCount: number,
    readonly ipAddress?: string,
  ) {
    super(aggregateId, version, { source: 'auth-service' });
  }

  toObject() {
    return {
      ...super.toObject(),
      attemptCount: this.attemptCount,
      ipAddress: this.ipAddress,
    };
  }
}
