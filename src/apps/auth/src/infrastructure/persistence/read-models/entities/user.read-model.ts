/**
 * User Read Model (ORM Entity for Query Database)
 *
 * This is a denormalized view optimized for read operations
 * It's updated by Projections listening to events from Event Store
 *
 * Key differences from UserAggregate:
 * - No business logic
 * - Optimized for queries
 * - Can be denormalized (duplicate data for performance)
 * - Updated asynchronously via projections (eventual consistency)
 */

import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_read_model' })
export class UserReadModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  failedSignInAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSignInAt?: Date;

  @Column({ nullable: true })
  lastSignInIp?: string;

  // Denormalized field for performance
  @Column({ default: 0 })
  totalSignIns!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Version for optimistic locking
  @Column({ default: 0 })
  version!: number;
}
