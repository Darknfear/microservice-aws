/**
 * Event Store
 * Port interface for event storage and retrieval
 *
 * Responsibilities:
 * - Store domain events
 * - Retrieve events for an aggregate
 * - Retrieve events for projections
 * - Support event snapshots for performance
 */

import type { DomainEvent } from '@/libs/core/base';

export interface IEventStore {
  /**
   * Append event to event store
   */
  append(aggregateId: string, events: DomainEvent[]): Promise<void>;

  /**
   * Get events for an aggregate (event stream)
   */
  getEventStream(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;

  /**
   * Get all events of a specific type
   */
  getEventsByType(eventType: string): Promise<DomainEvent[]>;

  /**
   * Get all events in the event store (for projections)
   */
  getAllEvents(fromVersion?: number): Promise<DomainEvent[]>;

  /**
   * Subscribe to events of a specific type
   */
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;

  /**
   * Get event count
   */
  getEventCount(): Promise<number>;
}
