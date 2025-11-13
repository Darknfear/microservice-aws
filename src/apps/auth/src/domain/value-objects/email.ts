/**
 * Email Value Object
 *
 * Represents an email address with validation.
 * Value Objects are immutable and have no identity.
 *
 * Key Principles:
 * - Immutable: Once created, cannot be changed
 * - Validated: Only valid emails can be created
 * - Self-contained: Contains validation logic
 */
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!Email.isValid(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    this.value = email.toLowerCase().trim();
  }

  /**
   * Validate email format
   */
  private static isValid(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // RFC 5322 compliant regex (simplified)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email) && email.length <= 254; // RFC 5321 max length
  }

  /**
   * Get email as string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get email value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compare with another email
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Create Email from string (factory method)
   */
  static create(email: string): Email {
    return new Email(email);
  }
}

