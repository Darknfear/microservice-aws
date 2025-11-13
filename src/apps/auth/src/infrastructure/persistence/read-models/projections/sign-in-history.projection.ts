/**
 * Sign In History Projection
 *
 * Listens to sign-in events and maintains sign-in history
 * This implements the CQRS Query Side (Read Model updates)
 *
 * Pattern: Event Handler → Read Model Update
 */

import { DomainEvent } from '@/libs/core/base';
import {
  InvalidSignInAttemptEvent,
  UserSignedInEvent,
} from '@apps/auth/src/domain/events/user.events';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignInHistoryReadModel } from '../entities/sign-in-history.read-model';

@Injectable()
export class SignInHistoryProjection {
  constructor(
    @InjectRepository(SignInHistoryReadModel, 'queryConnection')
    private readonly signInHistoryRepository: Repository<SignInHistoryReadModel>,
  ) {}

  /**
   * Handle domain events and update read model
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.constructor) {
      case UserSignedInEvent:
        await this.onUserSignedIn(event as UserSignedInEvent);
        break;
      case InvalidSignInAttemptEvent:
        await this.onInvalidSignInAttempt(event as InvalidSignInAttemptEvent);
        break;
      default:
        // Ignore unknown events
        break;
    }
  }

  /**
   * Record successful sign-in in history
   */
  private async onUserSignedIn(event: UserSignedInEvent): Promise<void> {
    const signInHistory = this.signInHistoryRepository.create({
      userId: event.aggregateId,
      username: event.username,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      success: true,
      eventVersion: event.version,
      createdAt: event.timestamp,
    });

    await this.signInHistoryRepository.save(signInHistory);
  }

  /**
   * Record failed sign-in attempt in history
   */
  private async onInvalidSignInAttempt(event: InvalidSignInAttemptEvent): Promise<void> {
    // Note: InvalidSignInAttemptEvent doesn't include username/userAgent
    // For a more complete implementation, we could:
    // 1. Look up username from UserReadModel using aggregateId
    // 2. Store userAgent in the event when it's created
    // For now, we'll record what we have

    const signInHistory = this.signInHistoryRepository.create({
      userId: event.aggregateId,
      username: 'unknown', // Could look up from user read model if needed
      ipAddress: event.ipAddress,
      userAgent: undefined,
      success: false,
      failureReason: `Invalid credentials (attempt #${event.attemptCount})`,
      eventVersion: event.version,
      createdAt: event.timestamp,
    });

    await this.signInHistoryRepository.save(signInHistory);
  }
}
