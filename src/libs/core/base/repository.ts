/**
 * Base Repository Interface
 * Abstract contract for all repositories
 *
 * Responsibilities:
 * - Define CRUD operations
 * - Define query operations
 * - Separate repository contract from implementation
 *
 * Key Principle:
 * Repositories are ports that define contracts for data access.
 * Implementation depends on infrastructure (TypeORM, Prisma, etc.)
 */

import type { BaseEntity } from './entity';

export interface IBaseRepository<T extends BaseEntity<any>> {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities
   */
  findAll(): Promise<T[]>;

  /**
   * Save entity (insert or update)
   */
  save(entity: T): Promise<T>;

  /**
   * Save multiple entities
   */
  saveMany(entities: T[]): Promise<T[]>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if entity exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count entities
   */
  count(): Promise<number>;
}

/**
 * Base Repository Abstract Class
 * Common implementation for all repositories
 */
export abstract class BaseRepository<T extends BaseEntity<any>> implements IBaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract save(entity: T): Promise<T>;
  abstract saveMany(entities: T[]): Promise<T[]>;

  async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(): Promise<number> {
    const entities = await this.findAll();
    return entities.length;
  }
}
