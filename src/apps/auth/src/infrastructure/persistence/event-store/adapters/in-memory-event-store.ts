/**
 * In-Memory Event Store
 * Simple implementation for development and testing
 * In production, use PostgreSQL, MongoDB, or EventStoreDB
 *
 * Responsibilities:
 * - Store events in memory
 * - Retrieve events by aggregate ID or type
 * - Support event subscriptions
 * - Provide event snapshots
 */

import { DomainEvent } from '@/libs/core/base';
import type { IEventStore } from '@apps/auth/src/application/ports/event-store/event-store.interface';
import { Injectable } from '@nestjs/common';

interface StoredEvent {
  aggregateId: string;
  event: DomainEvent;
  timestamp: Date;
  version: number;
}

type EventHandler = (event: DomainEvent) => Promise<void>;

@Injectable()
export class InMemoryEventStore implements IEventStore {
  private events: StoredEvent[] = [];
  private subscriptions = new Map<string, EventHandler[]>();
  private eventCounter = 0;

  /**
   * Append events to the event store
   */
  async append(aggregateId: string, events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.eventCounter++;

      const storedEvent: StoredEvent = {
        aggregateId,
        event,
        timestamp: new Date(),
        version: this.eventCounter,
      };

      this.events.push(storedEvent);

      // Notify subscribers
      await this.notifySubscribers(event);
    }
  }

  /**
   * Get event stream for an aggregate
   */
  async getEventStream(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    return this.events
      .filter(
        (item) => item.aggregateId === aggregateId && (!fromVersion || item.version > fromVersion),
      )
      .map((item) => item.event);
  }

  /**
   * Get all events of a specific type
   */
  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    return this.events
      .filter((item) => item.event.eventType === eventType)
      .map((item) => item.event);
  }

  /**
   * Get all events in the store
   */
  async getAllEvents(fromVersion?: number): Promise<DomainEvent[]> {
    return this.events
      .filter((item) => !fromVersion || item.version > fromVersion)
      .map((item) => item.event);
  }

  /**
   * Subscribe to events of a type
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const handlers = this.subscriptions.get(eventType);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Get total event count
   */
  async getEventCount(): Promise<number> {
    return this.events.length;
  }

  /**
   * Notify subscribers of an event
   */
  private async notifySubscribers(event: DomainEvent): Promise<void> {
    const handlers = this.subscriptions.get(event.eventType) || [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.eventType}:`, error);
      }
    }
  }

  /**
   * Clear all events (for testing)
   */
  async clear(): Promise<void> {
    this.events = [];
    this.eventCounter = 0;
  }
}
