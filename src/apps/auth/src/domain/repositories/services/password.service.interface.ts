/**
 * Password Service Port (Interface)
 *
 * Defines the contract for password hashing and verification services.
 * This is a port - usecases depend on this abstraction, not concrete implementations.
 *
 * Benefits:
 * - Usecases are independent of password hashing library (bcrypt, argon2, etc.)
 * - Easy to mock in tests
 * - Can swap implementations without changing usecase code
 */
export interface IPasswordService {
  /**
   * Hash a plain text password
   * @param password Plain text password
   * @returns Hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare plain text password with hashed password
   * @param password Plain text password
   * @param hash Hashed password
   * @returns true if passwords match, false otherwise
   */
  compare(password: string, hash: string): Promise<boolean>;
}
