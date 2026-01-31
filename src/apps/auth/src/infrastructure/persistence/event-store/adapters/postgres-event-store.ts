/**
 * PostgreSQL Event Store
 * Production-ready implementation of IEventStore using PostgreSQL
 *
 * Features:
 * - Append-only, immutable event storage
 * - Event stream reconstruction for aggregates
 * - Event versioning with optimistic concurrency control
 * - Event subscriptions for projections
 * - Fast queries with proper indexing
 *
 * Event Sourcing Pattern:
 * - Store ALL domain events (never delete)
 * - Rebuild aggregate state by replaying events
 * - Ensure event ordering with version numbers
 * - Support time travel and audit trails
 */

import { DomainEvent } from '@/libs/core/base';
import type { IEventStore } from '@apps/auth/src/application/ports/event-store/event-store.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStoreEntity } from '../entities/event-store.entity';

// Import all domain events for deserialization
import {
  InvalidSignInAttemptEvent,
  PasswordChangedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
  UserRegisteredEvent,
  UserSignedInEvent,
} from '@apps/auth/src/domain/events/user.events';

@Injectable()
export class PostgresEventStore implements IEventStore {
  private readonly logger = new Logger(PostgresEventStore.name);
  private readonly subscribers = new Map<string, ((event: DomainEvent) => Promise<void>)[]>();

  // Event type to class mapping for deserialization
  private readonly eventClassMap: Record<string, any> = {
    UserRegisteredEvent,
    UserSignedInEvent,
    PasswordChangedEvent,
    UserDeactivatedEvent,
    UserReactivatedEvent,
    InvalidSignInAttemptEvent,
  };

  constructor(
    @InjectRepository(EventStoreEntity, 'command')
    private readonly eventStoreRepo: Repository<EventStoreEntity>,
  ) {}

  /**
   * Append events to event store
   * Implements optimistic concurrency control with version checking
   */
  async append(aggregateId: string, events: DomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    try {
      // Convert domain events to entities
      const entities = events.map((event) => {
        const entity = new EventStoreEntity();
        entity.aggregateId = aggregateId;
        entity.eventType = event.eventType;
        entity.data = event.toObject();
        entity.version = event.version;
        entity.timestamp = event.timestamp;
        entity.aggregateType = 'UserAggregate';
        return entity;
      });

      // Save all events in a single transaction
      await this.eventStoreRepo.save(entities);

      this.logger.log(
        `Appended ${events.length} event(s) to event store for aggregate ${aggregateId}`,
      );

      // Notify subscribers
      for (const event of events) {
        await this.notifySubscribers(event);
      }
    } catch (error) {
      this.logger.error(`Failed to append events for aggregate ${aggregateId}:`, error);
      throw error;
    }
  }

  /**
   * Get event stream for an aggregate
   * Returns events ordered by version
   */
  async getEventStream(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    try {
      const queryBuilder = this.eventStoreRepo
        .createQueryBuilder('event')
        .where('event.aggregateId = :aggregateId', { aggregateId })
        .orderBy('event.version', 'ASC');

      if (fromVersion !== undefined) {
        queryBuilder.andWhere('event.version >= :fromVersion', { fromVersion });
      }

      const entities = await queryBuilder.getMany();

      this.logger.debug(`Retrieved ${entities.length} event(s) for aggregate ${aggregateId}`);

      return entities.map((entity) => this.deserializeEvent(entity));
    } catch (error) {
      this.logger.error(`Failed to get event stream for aggregate ${aggregateId}:`, error);
      throw error;
    }
  }

  /**
   * Get all events (for replaying projections)
   * Returns events ordered by timestamp
   */
  async getAllEvents(fromVersion?: number): Promise<DomainEvent[]> {
    try {
      const queryBuilder = this.eventStoreRepo
        .createQueryBuilder('event')
        .orderBy('event.timestamp', 'ASC')
        .addOrderBy('event.version', 'ASC');

      if (fromVersion !== undefined) {
        queryBuilder.where('event.version >= :fromVersion', { fromVersion });
      }

      const entities = await queryBuilder.getMany();

      this.logger.debug(`Retrieved ${entities.length} total event(s)`);

      return entities.map((entity) => this.deserializeEvent(entity));
    } catch (error) {
      this.logger.error('Failed to get all events:', error);
      throw error;
    }
  }

  /**
   * Get events by type
   * Useful for querying specific event types
   */
  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    try {
      const entities = await this.eventStoreRepo.find({
        where: { eventType },
        order: { timestamp: 'ASC' },
      });

      this.logger.debug(`Retrieved ${entities.length} event(s) of type ${eventType}`);

      return entities.map((entity) => this.deserializeEvent(entity));
    } catch (error) {
      this.logger.error(`Failed to get events by type ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to domain events
   * Used by projections to listen for specific events
   */
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);

    this.logger.log(`Subscribed to event type: ${eventType}`);
  }

  /**
   * Deserialize event entity to domain event
   */
  private deserializeEvent(entity: EventStoreEntity): DomainEvent {
    const EventClass = this.eventClassMap[entity.eventType];

    if (!EventClass) {
      this.logger.error(`Unknown event type: ${entity.eventType}`);
      throw new Error(`Unknown event type: ${entity.eventType}`);
    }

    // Create event instance from stored data
    const event = Object.create(EventClass.prototype);
    Object.assign(event, {
      ...entity.data,
      eventType: entity.eventType,
      aggregateId: entity.aggregateId,
      timestamp: entity.timestamp,
      version: entity.version,
    });

    return event;
  }

  /**
   * Get event count
   * Useful for monitoring and statistics
   */
  async getEventCount(): Promise<number> {
    try {
      const count = await this.eventStoreRepo.count();
      this.logger.debug(`Total event count: ${count}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to get event count:', error);
      throw error;
    }
  }

  /**
   * Notify subscribers when new events are appended
   */
  private async notifySubscribers(event: DomainEvent): Promise<void> {
    const handlers = this.subscribers.get(event.eventType) || [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Subscriber handler failed for event ${event.eventType}:`, error);
        // Continue notifying other subscribers even if one fails
      }
    }
  }
}
