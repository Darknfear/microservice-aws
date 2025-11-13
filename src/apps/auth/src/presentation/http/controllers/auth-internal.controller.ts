/**
 * Auth Internal Controller
 *
 * INTERNAL routes for inter-service communication
 * These endpoints should NOT be exposed via API Gateway
 *
 * Route Pattern: /internal/auth/*
 *
 * Purpose:
 * - Allow other microservices to query user data
 * - Provide internal APIs for service-to-service communication
 * - No authentication needed (internal network only)
 *
 * Security:
 * - Should be behind internal network/firewall
 * - Not accessible from public internet
 * - Can use API keys or mutual TLS for security
 */

import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

// Query Handlers (Read Side)
import {
  GetSignInHistoryQueryHandler,
  GetUserByUsernameQueryHandler,
  GetUserQueryHandler,
} from '@apps/auth/src/application/queries/handlers/query-handlers';

// Queries
import { GetSignInHistoryQuery } from '@apps/auth/src/application/queries/get-sign-in-history.query';
import {
  GetUserByUsernameQuery,
  GetUserQuery,
} from '@apps/auth/src/application/queries/get-user.query';

@Controller('internal/auth') // Internal routes
@UseFilters(DomainExceptionFilter)
export class AuthInternalController {
  constructor(
    // Query Handlers (Read Side only - internal services only read data)
    private readonly getUserQueryHandler: GetUserQueryHandler,
    private readonly getUserByUsernameQueryHandler: GetUserByUsernameQueryHandler,
    private readonly getSignInHistoryQueryHandler: GetSignInHistoryQueryHandler,
  ) {}

  /**
   * QUERY: GET /internal/auth/users/:userId
   * Get user information (for other services)
   *
   * Example: Order Service needs username for order display
   */
  @Get('users/:userId')
  async getUserById(@Param('userId') userId: string) {
    const query = new GetUserQuery(userId);
    const result = await this.getUserQueryHandler.execute(query);

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  /**
   * QUERY: GET /internal/auth/users/by-username/:username
   * Get user by username (for other services)
   *
   * Example: User Service needs to check if username exists
   */
  @Get('users/by-username/:username')
  async getUserByUsername(@Param('username') username: string) {
    const query = new GetUserByUsernameQuery(username);
    const result = await this.getUserByUsernameQueryHandler.execute(query);

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  /**
   * QUERY: GET /internal/auth/users/:userId/sign-in-history
   * Get sign-in history for a user (for other services)
   *
   * Example: Admin Service needs sign-in history for security audit
   */
  @Get('users/:userId/sign-in-history')
  async getSignInHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const query = new GetSignInHistoryQuery(userId, limit, offset);
    const result = await this.getSignInHistoryQueryHandler.execute(query);

    return {
      userId,
      history: result,
      total: result.length,
    };
  }

  /**
   * QUERY: GET /internal/auth/users/bulk
   * Get multiple users by IDs (for other services)
   *
   * Example: Order Service needs usernames for multiple orders
   *
   * Note: Not implemented yet - would require new query handler
   */
  @Get('users/bulk')
  async getUsersBulk(@Query('ids') ids: string) {
    // Parse comma-separated IDs
    const userIds = ids.split(',');

    // TODO: Implement bulk query handler for performance
    // For now, query one by one (not efficient)
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const query = new GetUserQuery(userId);
        return await this.getUserQueryHandler.execute(query);
      }),
    );

    return {
      users: users.filter((u) => u !== null),
      total: users.length,
    };
  }
}
