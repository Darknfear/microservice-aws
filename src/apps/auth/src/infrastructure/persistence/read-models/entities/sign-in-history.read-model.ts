/**
 * Sign In History Read Model (ORM Entity for Query Database)
 *
 * Denormalized table for tracking sign-in history
 * This enables fast queries like "show last 10 sign-ins for user X"
 * without replaying events
 */

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sign_in_history' })
@Index(['userId', 'createdAt'])
export class SignInHistoryReadModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ default: true })
  success!: boolean;

  @Column({ nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Event version for idempotency
  @Column()
  eventVersion!: number;
}
