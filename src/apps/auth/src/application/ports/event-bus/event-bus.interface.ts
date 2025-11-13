/**
 * Event Bus Port Interface
 * Defines contract for event publishing
 *
 * Dependency Inversion Principle:
 * - Usecases depend on this interface (port), not concrete implementation
 * - Infrastructure layer (EventBusService) implements this interface
 *
 * Responsibilities:
 * - Publish aggregate events to Event Store (Command DB)
 * - Trigger projections to update Read Models (Query DB)
 * - Publish events to Message Broker for other services
 */

import { UserAggregate } from '@apps/auth/src/domain/aggregates/user.aggregate';

export interface IEventBus {
  /**
   * Publish aggregate events
   *
   * This method:
   * 1. Saves events to Event Store (Command DB) - append only, immutable
   * 2. Triggers Projections to update Read Models (Query DB) - eventual consistency
   * 3. Publishes to Message Broker for other services
   * 4. Marks events as committed on aggregate
   *
   * @param aggregate - The aggregate with uncommitted events
   */
  publishAggregateEvents(aggregate: UserAggregate): Promise<void>;
}
