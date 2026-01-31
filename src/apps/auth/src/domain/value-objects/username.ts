/**
 * Username Value Object
 *
 * Represents a username with validation rules.
 * Value Objects are immutable and have no identity.
 *
 * Key Principles:
 * - Immutable: Once created, cannot be changed
 * - Validated: Only valid usernames can be created
 * - Self-contained: Contains validation logic
 */
export class Username {
  private readonly value: string;

  constructor(username: string) {
    if (!Username.isValid(username)) {
      throw new Error(
        `Invalid username: ${username}. Username must be 3-50 characters, alphanumeric with underscores and hyphens only.`,
      );
    }
    this.value = username.trim();
  }

  /**
   * Validate username format
   * Rules:
   * - 3-50 characters
   * - Alphanumeric, underscores, and hyphens only
   * - Cannot start or end with underscore or hyphen
   * - Cannot contain consecutive underscores or hyphens
   */
  private static isValid(username: string): boolean {
    if (!username || typeof username !== 'string') {
      return false;
    }

    const trimmed = username.trim();

    // Length check
    if (trimmed.length < 3 || trimmed.length > 50) {
      return false;
    }

    // Only alphanumeric, underscores, and hyphens
    const validPattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;
    if (!validPattern.test(trimmed)) {
      return false;
    }

    // Cannot have consecutive underscores or hyphens
    if (
      trimmed.includes('__') ||
      trimmed.includes('--') ||
      trimmed.includes('_-') ||
      trimmed.includes('-_')
    ) {
      return false;
    }

    return true;
  }

  /**
   * Get username as string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get username value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compare with another username
   */
  equals(other: Username): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  /**
   * Create Username from string (factory method)
   */
  static create(username: string): Username {
    return new Username(username);
  }
}
