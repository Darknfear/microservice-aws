/**
 * Get Sign In History Query
 * Query to retrieve user's sign-in history from Read Model
 *
 * This demonstrates a denormalized read model optimized for queries
 */

export class GetSignInHistoryQuery {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
