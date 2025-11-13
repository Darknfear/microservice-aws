/**
 * Get User Query
 * Query to retrieve user information from Read Model
 *
 * Queries are read-only operations
 * They go to the Query Side (Read Model) - NOT to Event Store
 */

export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserByUsernameQuery {
  constructor(public readonly username: string) {}
}
