/**
 * Change Password Command
 * Represents the intention to change a user's password
 */

export class ChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}
