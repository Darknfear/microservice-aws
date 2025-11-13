/**
 * User ORM Entity
 *
 * Represents the User table in the database.
 * This is a technical entity, specific to TypeORM.
 *
 * Differs from User domain entity:
 * - ORM entity has database decorators (TypeORM)
 * - ORM entity doesn't have business logic methods
 * - Used for database mapping and queries only
 *
 * Conversion:
 * Repository converts between ORM Entity ↔ Domain Entity
 */
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
