/**
 * Create User Command
 * Represents the intention to create a new user
 *
 * This command triggers UserRegisteredEvent
 */

export class CreateUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
