/**
 * User Projection
 *
 * Listens to domain events and updates the User Read Model
 * This implements the CQRS Query Side (Read Model updates)
 *
 * Pattern: Event Handler → Read Model Update
 */

import { DomainEvent } from '@/libs/core/base';
import {
  PasswordChangedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
  UserRegisteredEvent,
  UserSignedInEvent,
} from '@apps/auth/src/domain/events/user.events';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReadModel } from '../entities/user.read-model';

@Injectable()
export class UserProjection {
  constructor(
    @InjectRepository(UserReadModel, 'queryConnection')
    private readonly userReadModelRepository: Repository<UserReadModel>,
  ) {}

  /**
   * Handle domain events and update read model
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.constructor) {
      case UserRegisteredEvent:
        await this.onUserRegistered(event as UserRegisteredEvent);
        break;
      case UserSignedInEvent:
        await this.onUserSignedIn(event as UserSignedInEvent);
        break;
      case UserDeactivatedEvent:
        await this.onUserDeactivated(event as UserDeactivatedEvent);
        break;
      case UserReactivatedEvent:
        await this.onUserReactivated(event as UserReactivatedEvent);
        break;
      case PasswordChangedEvent:
        await this.onPasswordChanged(event as PasswordChangedEvent);
        break;
      default:
        // Ignore unknown events
        break;
    }
  }

  /**
   * Create user in read model when registered
   */
  private async onUserRegistered(event: UserRegisteredEvent): Promise<void> {
    const userReadModel = this.userReadModelRepository.create({
      id: event.aggregateId,
      username: event.username,
      email: event.email,
      passwordHash: event.passwordHash,
      isActive: true,
      failedSignInAttempts: 0,
      totalSignIns: 0,
      version: 1,
    });

    await this.userReadModelRepository.save(userReadModel);
  }

  /**
   * Update user read model when signed in
   */
  private async onUserSignedIn(event: UserSignedInEvent): Promise<void> {
    const user = await this.userReadModelRepository.findOne({
      where: { id: event.aggregateId },
    });

    if (!user) {
      console.warn(`User not found in read model: ${event.aggregateId}`);
      return;
    }

    user.lastSignInAt = event.timestamp;
    user.lastSignInIp = event.ipAddress;
    user.totalSignIns += 1;
    user.failedSignInAttempts = 0; // Reset failed attempts on successful sign-in
    user.version += 1;

    await this.userReadModelRepository.save(user);
  }

  /**
   * Deactivate user in read model
   */
  private async onUserDeactivated(event: UserDeactivatedEvent): Promise<void> {
    const user = await this.userReadModelRepository.findOne({
      where: { id: event.aggregateId },
    });

    if (!user) {
      console.warn(`User not found in read model: ${event.aggregateId}`);
      return;
    }

    user.isActive = false;
    user.version += 1;

    await this.userReadModelRepository.save(user);
  }

  /**
   * Reactivate user in read model
   */
  private async onUserReactivated(event: UserReactivatedEvent): Promise<void> {
    const user = await this.userReadModelRepository.findOne({
      where: { id: event.aggregateId },
    });

    if (!user) {
      console.warn(`User not found in read model: ${event.aggregateId}`);
      return;
    }

    user.isActive = true;
    user.failedSignInAttempts = 0; // Reset failed attempts
    user.version += 1;

    await this.userReadModelRepository.save(user);
  }

  /**
   * Update password hash in read model
   */
  private async onPasswordChanged(event: PasswordChangedEvent): Promise<void> {
    const user = await this.userReadModelRepository.findOne({
      where: { id: event.aggregateId },
    });

    if (!user) {
      console.warn(`User not found in read model: ${event.aggregateId}`);
      return;
    }

    user.passwordHash = event.newPasswordHash;
    user.version += 1;

    await this.userReadModelRepository.save(user);
  }
}
