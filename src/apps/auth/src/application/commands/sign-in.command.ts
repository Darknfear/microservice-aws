/**
 * Sign In Command
 * Represents the intention to sign in a user
 *
 * Commands are write operations that modify the system state
 * They go to the Command Side (Write Model) and produce events
 */

export class SignInCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
