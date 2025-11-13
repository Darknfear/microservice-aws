/**
 * Event Store Entity
 * Stores domain events in PostgreSQL for Event Sourcing
 *
 * Table Design:
 * - Append-only, immutable (never UPDATE or DELETE)
 * - Indexed by aggregateId for fast event stream retrieval
 * - Indexed by eventType for querying specific events
 * - JSONB data column for flexible event data storage
 *
 * Event Sourcing Pattern:
 * - Each row represents a domain event
 * - Events are ordered by version within each aggregate
 * - Aggregates are rebuilt by replaying events in order
 */

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_store')
@Index(['aggregateId', 'version'], { unique: true }) // Ensure version uniqueness per aggregate
@Index(['eventType']) // Fast queries by event type
@Index(['timestamp']) // Fast queries by time range
export class EventStoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index() // Fast lookups by aggregate
  aggregateId!: string;

  @Column({ type: 'varchar', length: 100 })
  eventType!: string;

  @Column({ type: 'jsonb' })
  data!: Record<string, any>;

  @Column({ type: 'int' })
  version!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  aggregateType?: string; // e.g., 'UserAggregate'

  @Column({ type: 'varchar', length: 255, nullable: true })
  correlationId?: string; // For tracking related events

  @Column({ type: 'varchar', length: 255, nullable: true })
  causationId?: string; // For tracking event causality
}
