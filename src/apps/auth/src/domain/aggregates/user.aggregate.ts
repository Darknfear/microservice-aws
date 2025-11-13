/**
 * User Entity (Event Sourcing Version)
 * Domain entity representing a user with event sourcing
 *
 * Key Differences from Traditional Entity:
 * - State is derived from replaying events
 * - All changes are recorded as events
 * - No direct state mutation (only through events)
 * - Supports audit trail and time travel
 *
 * Aggregate Root Pattern:
 * - User is an aggregate root
 * - Contains its own domain logic
 * - Guards aggregate invariants
 */

import { BaseEntity, DomainEvent } from '@/libs/core/base';
import {
  InvalidSignInAttemptEvent,
  PasswordChangedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
  UserRegisteredEvent,
  UserSignedInEvent,
} from '@apps/auth/src/domain/events/user.events';

export class UserAggregate extends BaseEntity<Record<string, unknown>> {
  username: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedSignInAttempts: number;
  lastSignInAt?: Date;
  lastSignInIp?: string;

  constructor(data?: {
    id?: string;
    username?: string;
    email?: string;
    passwordHash?: string;
    isActive?: boolean;
    failedSignInAttempts?: number;
    lastSignInAt?: Date;
    lastSignInIp?: string;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
  }) {
    super(data);
    this.username = data?.username || '';
    this.email = data?.email || '';
    this.passwordHash = data?.passwordHash || '';
    this.isActive = data?.isActive ?? true;
    this.failedSignInAttempts = data?.failedSignInAttempts || 0;
    this.lastSignInAt = data?.lastSignInAt;
    this.lastSignInIp = data?.lastSignInIp;
  }

  /**
   * Create a new user (generates UserRegisteredEvent)
   */
  static create(username: string, email: string, passwordHash: string): UserAggregate {
    const user = new UserAggregate({
      username,
      email,
      passwordHash,
      isActive: true,
    });

    // Record the registration event
    const event = new UserRegisteredEvent(user.id, user.version, username, email, passwordHash);
    user.addEvent(event);
    user.incrementVersion();

    return user;
  }

  /**
   * Register a successful sign-in
   */
  recordSignIn(ipAddress?: string, userAgent?: string): void {
    if (!this.isActive) {
      throw new Error('Cannot sign in: user account is inactive');
    }

    // Reset failed attempts
    this.failedSignInAttempts = 0;
    this.lastSignInAt = new Date();
    this.lastSignInIp = ipAddress;
    this.touch();

    // Record the event
    const event = new UserSignedInEvent(this.id, this.version, this.username, ipAddress, userAgent);
    this.addEvent(event);
  }

  /**
   * Record a failed sign-in attempt
   */
  recordFailedSignInAttempt(ipAddress?: string): void {
    this.failedSignInAttempts++;
    this.touch();

    // Lock account after 5 failed attempts
    if (this.failedSignInAttempts >= 5) {
      this.isActive = false;
      const event = new UserDeactivatedEvent(
        this.id,
        this.version,
        'Too many failed sign-in attempts',
      );
      this.addEvent(event);
    } else {
      const event = new InvalidSignInAttemptEvent(
        this.id,
        this.version,
        this.failedSignInAttempts,
        ipAddress,
      );
      this.addEvent(event);
    }
  }

  /**
   * Deactivate user account
   */
  deactivate(reason?: string): void {
    if (!this.isActive) {
      throw new Error('User is already inactive');
    }

    this.isActive = false;
    this.touch();

    const event = new UserDeactivatedEvent(this.id, this.version, reason);
    this.addEvent(event);
  }

  /**
   * Reactivate user account
   */
  reactivate(): void {
    if (this.isActive) {
      throw new Error('User is already active');
    }

    this.isActive = true;
    this.failedSignInAttempts = 0;
    this.touch();

    const event = new UserReactivatedEvent(this.id, this.version);
    this.addEvent(event);
  }

  /**
   * Change password
   */
  changePassword(oldPasswordHash: string, newPasswordHash: string): void {
    if (this.passwordHash !== oldPasswordHash) {
      throw new Error('Current password does not match');
    }

    this.passwordHash = newPasswordHash;
    this.touch();

    const event = new PasswordChangedEvent(this.id, this.version, oldPasswordHash, newPasswordHash);
    this.addEvent(event);
  }

  /**
   * Check if user account is active
   */
  isUserActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if account is locked (too many failed attempts)
   */
  isLocked(): boolean {
    return this.failedSignInAttempts >= 5;
  }

  /**
   * Get user as plain object
   */
  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: this.isActive,
      failedSignInAttempts: this.failedSignInAttempts,
      lastSignInAt: this.lastSignInAt,
      lastSignInIp: this.lastSignInIp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }

  /**
   * Reconstruct user from event stream
   */
  static fromEventStream(events: DomainEvent[]): UserAggregate {
    const user = new UserAggregate();

    for (const event of events) {
      user.applyEvent(event);
    }

    // Mark all events as committed (not uncommitted)
    user.markEventsAsCommitted();

    return user;
  }

  /**
   * Apply event to reconstruct state
   */
  private applyEvent(event: DomainEvent): void {
    if (event instanceof UserRegisteredEvent) {
      this.id = event.aggregateId;
      this.username = event.username;
      this.email = event.email;
      this.passwordHash = event.passwordHash;
      this.isActive = true;
      this.failedSignInAttempts = 0;
      this.version = event.version;
    } else if (event instanceof UserSignedInEvent) {
      this.failedSignInAttempts = 0;
      this.lastSignInAt = event.timestamp;
      this.lastSignInIp = event.ipAddress;
      this.version = event.version;
    } else if (event instanceof UserDeactivatedEvent) {
      this.isActive = false;
      this.version = event.version;
    } else if (event instanceof UserReactivatedEvent) {
      this.isActive = true;
      this.failedSignInAttempts = 0;
      this.version = event.version;
    } else if (event instanceof PasswordChangedEvent) {
      this.passwordHash = event.newPasswordHash;
      this.version = event.version;
    } else if (event instanceof InvalidSignInAttemptEvent) {
      this.failedSignInAttempts = event.attemptCount;
      this.version = event.version;
    }

    this.updatedAt = event.timestamp;
  }
}
