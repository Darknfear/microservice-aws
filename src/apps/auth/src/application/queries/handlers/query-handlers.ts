/**
 * Query Handlers
 * Handle queries and retrieve data from Read Models (Query DB)
 *
 * CQRS Pattern:
 * - Query Handlers only READ data
 * - They query Read Models (denormalized views)
 * - They do NOT interact with Event Store or Aggregates
 * - Fast and optimized for specific use cases
 */

import { SignInHistoryReadModel } from '@/apps/auth/src/infrastructure/persistence/read-models/entities/sign-in-history.read-model';
import { UserReadModel } from '@/apps/auth/src/infrastructure/persistence/read-models/entities/user.read-model';
import { GetSignInHistoryQuery } from '@apps/auth/src/application/queries/get-sign-in-history.query';
import {
  GetUserByUsernameQuery,
  GetUserQuery,
} from '@apps/auth/src/application/queries/get-user.query';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface UserQueryResult {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  failedSignInAttempts: number;
  totalSignIns: number;
  lastSignInAt?: Date;
  lastSignInIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignInHistoryItem {
  id: string;
  userId: string;
  username: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  createdAt: Date;
}

/**
 * User Query Handler
 * Retrieves user information from Read Model
 */
@Injectable()
export class GetUserQueryHandler {
  constructor(
    @InjectRepository(UserReadModel, 'queryConnection')
    private readonly userReadModelRepo: Repository<UserReadModel>,
  ) {}

  async execute(query: GetUserQuery): Promise<UserQueryResult | null> {
    const user = await this.userReadModelRepo.findOne({
      where: { id: query.userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      failedSignInAttempts: user.failedSignInAttempts,
      totalSignIns: user.totalSignIns,
      lastSignInAt: user.lastSignInAt,
      lastSignInIp: user.lastSignInIp,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

/**
 * Get User By Username Query Handler
 */
@Injectable()
export class GetUserByUsernameQueryHandler {
  constructor(
    @InjectRepository(UserReadModel, 'queryConnection')
    private readonly userReadModelRepo: Repository<UserReadModel>,
  ) {}

  async execute(query: GetUserByUsernameQuery): Promise<UserQueryResult | null> {
    const user = await this.userReadModelRepo.findOne({
      where: { username: query.username },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      failedSignInAttempts: user.failedSignInAttempts,
      totalSignIns: user.totalSignIns,
      lastSignInAt: user.lastSignInAt,
      lastSignInIp: user.lastSignInIp,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

/**
 * Sign In History Query Handler
 * Retrieves sign-in history from Read Model
 */
@Injectable()
export class GetSignInHistoryQueryHandler {
  constructor(
    @InjectRepository(SignInHistoryReadModel, 'queryConnection')
    private readonly signInHistoryRepo: Repository<SignInHistoryReadModel>,
  ) {}

  async execute(query: GetSignInHistoryQuery): Promise<SignInHistoryItem[]> {
    const history = await this.signInHistoryRepo.find({
      where: { userId: query.userId },
      order: { createdAt: 'DESC' },
      take: query.limit || 10,
      skip: query.offset || 0,
    });

    return history.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: item.username,
      ipAddress: item.ipAddress,
      userAgent: item.userAgent,
      success: item.success,
      failureReason: item.failureReason,
      createdAt: item.createdAt,
    }));
  }
}
