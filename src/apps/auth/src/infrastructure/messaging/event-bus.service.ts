/**
 * Event Bus (Infrastructure Service)
 * Orchestrates event publishing and projection updates
 *
 * Responsibilities:
 * - Publish events from aggregates to event store (Command DB)
 * - Trigger projections to update Read Models (Query DB)
 * - Trigger event subscriptions
 * - Emit events to message broker for other services
 *
 * CQRS Flow:
 * Command → Aggregate → Events → Event Store (Command DB)
 *                              → Projections → Read Models (Query DB)
 *                              → Message Broker → Other Services
 */

import { DomainEvent } from '@/libs/core/base';
import { MessageBrokerService, MessageEvent } from '@/libs/message-broker/message-broker.service';
import type { IEventBus } from '@apps/auth/src/application/ports/event-bus/event-bus.interface';
import type { IEventStore } from '@apps/auth/src/application/ports/event-store/event-store.interface';
import { UserAggregate } from '@apps/auth/src/domain/aggregates/user.aggregate';
import { Inject, Injectable, Optional } from '@nestjs/common';

// Import projections (optional to avoid circular dependencies)
import type { SignInHistoryProjection } from '@apps/auth/src/infrastructure/persistence/read-models/projections/sign-in-history.projection';
import type { UserProjection } from '@apps/auth/src/infrastructure/persistence/read-models/projections/user.projection';

@Injectable()
export class EventBusService implements IEventBus {
  constructor(
    @Inject('IEventStore')
    private eventStore: IEventStore,
    private messageBroker: MessageBrokerService,
    @Optional() @Inject('UserProjection') private userProjection?: UserProjection,
    @Optional()
    @Inject('SignInHistoryProjection')
    private signInHistoryProjection?: SignInHistoryProjection,
  ) {}

  /**
   * Publish aggregate events
   * This is called after an aggregate is modified
   *
   * CQRS Flow:
   * 1. Save to Event Store (Command DB) - append only, immutable
   * 2. Trigger Projections to update Read Models (Query DB) - eventual consistency
   * 3. Publish to Message Broker for other services
   * 4. Trigger local subscriptions
   */
  async publishAggregateEvents(aggregate: UserAggregate): Promise<void> {
    const events = aggregate.getUncommittedEvents();

    if (events.length === 0) {
      return;
    }

    // 1. Save events to event store (Command DB)
    await this.eventStore.append(aggregate.id, events);

    // 2. Update projections (Query DB)
    // This implements eventual consistency between Command DB and Query DB
    for (const event of events) {
      try {
        // Update User Read Model
        if (this.userProjection) {
          await this.userProjection.handleEvent(event);
        }

        // Update Sign-In History Read Model
        if (this.signInHistoryProjection) {
          await this.signInHistoryProjection.handleEvent(event);
        }
      } catch (error) {
        console.error(
          `[EventBus] Failed to update projection for event ${event.eventType}:`,
          error,
        );
        // In production: retry, dead letter queue, alerting
      }
    }

    // 3. Publish each event to message broker (for other services)
    for (const event of events) {
      const messageEvent: MessageEvent = {
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        timestamp: event.timestamp,
        data: event.toObject(),
        version: event.version,
      };

      await this.messageBroker.publish(messageEvent);
    }

    // 4. Trigger local event subscriptions
    for (const event of events) {
      // Event store will notify subscribers
    }

    // 5. Mark events as committed
    aggregate.markEventsAsCommitted();
  }

  /**
   * Subscribe to domain events (for local projections)
   */
  subscribeToEvents(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.eventStore.subscribe(eventType, handler);
  }

  /**
   * Get event stream for an aggregate
   */
  async getEventStream(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    return this.eventStore.getEventStream(aggregateId, fromVersion);
  }

  /**
   * Get all events (for replaying projections)
   */
  async getAllEvents(fromVersion?: number): Promise<DomainEvent[]> {
    return this.eventStore.getAllEvents(fromVersion);
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    return this.eventStore.getEventsByType(eventType);
  }
}
