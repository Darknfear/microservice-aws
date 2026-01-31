/**
 * Base Entity
 * Abstract base class for all domain entities
 *
 * Responsibilities:
 * - Provide common entity properties (id, timestamps)
 * - Define interface for entity methods
 * - Enable entity comparison and validation
 * - Support event emission for event sourcing
 *
 * Key Principle:
 * Entities are domain models with identity and business logic.
 * They are independent of any framework or database.
 */

import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity<T extends Record<string, unknown>> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;

  // Events accumulated by this entity
  private uncommittedEvents: DomainEvent[] = [];

  constructor(
    data?: Partial<T> & { id?: string; createdAt?: Date; updatedAt?: Date; version?: number },
  ) {
    this.id = data?.id || uuidv4();
    this.createdAt = data?.createdAt || new Date();
    this.updatedAt = data?.updatedAt || new Date();
    this.version = data?.version || 0;
  }

  /**
   * Check if entity is new (no ID assigned yet)
   */
  isNew(): boolean {
    return this.version === 0;
  }

  /**
   * Update modification timestamp
   */
  touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Increment version for event sourcing
   */
  incrementVersion(): void {
    this.version++;
  }

  /**
   * Add an uncommitted event (for event sourcing)
   */
  addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.incrementVersion();
  }

  /**
   * Get all uncommitted events
   */
  getUncommittedEvents(): DomainEvent[] {
    return this.uncommittedEvents;
  }

  /**
   * Mark events as committed
   */
  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  /**
   * Compare equality with another entity (by ID)
   */
  equals(other: BaseEntity<T>): boolean {
    return this.id === other.id;
  }

  /**
   * Get entity as plain object
   */
  abstract toObject(): T;

  /**
   * Create entity from plain object
   */
  static fromObject<E extends BaseEntity<any>>(
    this: new (data?: any) => E,
    data: Record<string, unknown>,
  ): E {
    return new this(data as any);
  }
}

/**
 * Domain Event
 * Base class for all domain events
 */
export abstract class DomainEvent {
  abstract readonly eventType: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly version: number;
  readonly metadata?: Record<string, unknown>;
  readonly payload?: Record<string, unknown>;
  readonly prevData?: Record<string, unknown>;

  constructor(
    aggregateId: string,
    version: number,
    payload?: Record<string, unknown>,
    prevData?: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ) {
    this.aggregateId = aggregateId;
    this.timestamp = new Date();
    this.version = version;
    this.metadata = metadata;
    this.payload = payload;
    this.prevData = prevData;
  }

  /**
   * Convert event to plain object
   */
  toObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      timestamp: this.timestamp,
      version: this.version,
      metadata: this.metadata,
      payload: this.payload,
      prevData: this.prevData,
    };
  }
}
